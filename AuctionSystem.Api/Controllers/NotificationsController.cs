using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AuctionSystem.Api.Data;

namespace AuctionSystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public NotificationsController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserNotifications(int userId)
        {
            try
            {
                // Get all orders for this user (won auctions)
                var notifications = await _db.Orders
                    .Where(o => o.WinnerId == userId)
                    .Include(o => o.Auction)
                    .OrderByDescending(o => o.OrderDate)
                    .Select(o => new
                    {
                        id = o.Id,
                        auctionId = o.AuctionId,
                        auctionTitle = o.Auction != null ? o.Auction.Title : "Unknown Auction",
                        auctionImageUrl = o.Auction != null ? o.Auction.ImageUrl : null,
                        finalPrice = o.FinalPrice,
                        orderDate = o.OrderDate,
                        status = o.Status,
                        isPaid = o.Status == "Paid" || o.Status == "Completed",
                        message = $"Congratulations! You won the auction for {(o.Auction != null ? o.Auction.Title : "this item")}!"
                    })
                    .ToListAsync();

                return Ok(new
                {
                    count = notifications.Count,
                    notifications = notifications
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching notifications: {ex.Message}");
                return StatusCode(500, $"Failed to fetch notifications: {ex.Message}");
            }
        }

        [HttpGet("user/{userId}/unread-count")]
        public async Task<IActionResult> GetUnreadNotificationsCount(int userId)
        {
            try
            {
                // Count pending orders (unpaid won auctions)
                var unreadCount = await _db.Orders
                    .Where(o => o.WinnerId == userId && o.Status == "Pending")
                    .CountAsync();

                return Ok(new { count = unreadCount });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching unread count: {ex.Message}");
                return StatusCode(500, $"Failed to fetch unread count: {ex.Message}");
            }
        }

        [HttpPost("{orderId}/mark-viewed")]
        public async Task<IActionResult> MarkNotificationAsViewed(int orderId)
        {
            try
            {
                var order = await _db.Orders.FindAsync(orderId);
                if (order == null)
                    return NotFound("Order not found");

                // You could add a 'IsViewed' field to Order model in the future
                // For now, this endpoint exists for future expansion
                
                return Ok(new { message = "Notification marked as viewed" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error marking notification: {ex.Message}");
                return StatusCode(500, $"Failed to mark notification: {ex.Message}");
            }
        }
    }
}
