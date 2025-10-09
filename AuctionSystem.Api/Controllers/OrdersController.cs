using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AuctionSystem.Api.Data;
using AuctionSystem.Api.Models;

namespace AuctionSystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public OrdersController(ApplicationDbContext db) => _db = db;

        [HttpPost("create-from-auction/{auctionId}")]
        public async Task<IActionResult> CreateOrderFromAuction(int auctionId)
        {
            var auction = await _db.Auctions.FindAsync(auctionId);
            if (auction == null || !auction.IsClosed)
                return BadRequest("Auction not found or not closed");

            var existingOrder = await _db.Orders.FirstOrDefaultAsync(o => o.AuctionId == auctionId);
            if (existingOrder != null)
                return Ok(existingOrder);

            var winningBid = await _db.Bids
                .Where(b => b.AuctionId == auctionId)
                .OrderByDescending(b => b.Amount)
                .ThenByDescending(b => b.PlacedAt)
                .FirstOrDefaultAsync();

            if (winningBid == null)
                return BadRequest("No bids found for this auction");

            var order = new Order
            {
                AuctionId = auctionId,
                WinnerId = winningBid.UserId,
                FinalPrice = winningBid.Amount,
                OrderDate = DateTime.UtcNow,
                Status = "Pending"
            };

            _db.Orders.Add(order);
            await _db.SaveChangesAsync();
            return Ok(order);
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserOrders(int userId)
        {
            var orders = await _db.Orders
                .Where(o => o.WinnerId == userId)
                .OrderByDescending(o => o.OrderDate)
                .Include(o => o.Auction)
                .Select(o => new
                {
                    o.Id,
                    o.AuctionId,
                    o.FinalPrice,
                    o.OrderDate,
                    o.Status,
                    o.ShippingAddress,
                    o.PaymentMethod,
                    o.PaymentReference,
                    Auction = new { o.Auction.Title, o.Auction.Description }
                })
                .ToListAsync();

            return Ok(orders);
        }

        [HttpGet("{orderId}")]
        public async Task<IActionResult> GetOrder(int orderId)
        {
            var order = await _db.Orders
                .Include(o => o.Auction)
                .Where(o => o.Id == orderId)
                .Select(o => new
                {
                    o.Id,
                    o.AuctionId,
                    o.FinalPrice,
                    o.OrderDate,
                    o.Status,
                    o.ShippingAddress,
                    o.PaymentMethod,
                    o.PaymentReference,
                    Auction = new { o.Auction.Title, o.Auction.Description }
                })
                .FirstOrDefaultAsync();

            return order == null ? NotFound() : Ok(order);
        }
        //add pay controller to here 
    }

    public class PaymentRequest
    {
        public string PaymentMethod { get; set; } = default!;
        public string? CardNumber { get; set; }
        public string ShippingAddress { get; set; } = default!;
    }
}
