using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AuctionSystem.Api.Data;

namespace AuctionSystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        public AdminController(ApplicationDbContext db) => _db = db;

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            try
            {
                var totalUsers = await _db.Users.CountAsync();
                var activeAuctions = await _db.Auctions.CountAsync(a => !a.IsClosed);
                var totalBids = await _db.Bids.CountAsync();

                // Calculate revenue from closed auctions
                var revenue = await _db.Auctions
                    .Where(a => a.IsClosed)
                    .SumAsync(a => a.CurrentPrice);

                // Get recent auctions (last 10)
                var recentAuctions = await _db.Auctions
                    .OrderByDescending(a => a.CreatedAt)
                    .Take(10)
                    .Select(a => new
                    {
                        a.Id,
                        a.Title,
                        CurrentBid = a.CurrentPrice,
                        a.CreatedAt,
                        a.IsClosed
                    })
                    .ToListAsync();

                // Get top bidders
                var bidData = await _db.Bids
                    .Join(_db.Users, b => b.UserId, u => u.Id, (b, u) => new { b.UserId, u.Username, b.Amount })
                    .ToListAsync();

                var topBidders = bidData
                    .GroupBy(x => new { x.UserId, x.Username })
                    .Select(g => new
                    {
                        UserId = g.Key.UserId,
                        Username = g.Key.Username,
                        TotalBids = g.Count(),
                        TotalAmount = g.Sum(x => x.Amount)
                    })
                    .OrderByDescending(x => x.TotalAmount)
                    .Take(5)
                    .ToList();

                // Get revenue by day for the last 7 days
                var sevenDaysAgo = DateTime.UtcNow.AddDays(-7);
                var revenueByDayRaw = await _db.Auctions
                    .Where(a => a.IsClosed && a.CreatedAt >= sevenDaysAgo)
                    .Select(a => new { a.CreatedAt, a.CurrentPrice })
                    .ToListAsync();

                var revenueByDay = revenueByDayRaw
                    .GroupBy(a => a.CreatedAt.Date)
                    .Select(g => new
                    {
                        Date = g.Key.ToString("yyyy-MM-dd"),
                        Revenue = g.Sum(a => a.CurrentPrice)
                    })
                    .OrderBy(x => x.Date)
                    .ToList();

                var dashboardData = new
                {
                    totals = new
                    {
                        users = totalUsers,
                        activeAuctions = activeAuctions,
                        bids = totalBids,
                        revenue = revenue
                    },
                    recentAuctions = recentAuctions,
                    topBidders = topBidders,
                    revenueByDay = revenueByDay
                };

                return Ok(dashboardData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Failed to load dashboard data: {ex.Message}");
            }
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers() =>
            Ok(await _db.Users.Select(u => new { u.Id, u.Username, u.Email, u.Role }).ToListAsync());

        [HttpPost("users/{id}/role")]
        public async Task<IActionResult> SetUserRole(int id, [FromQuery] string role)
        {
            var user = await _db.Users.FindAsync(id);
            if (user == null) return NotFound();
            if (string.IsNullOrWhiteSpace(role)) return BadRequest("Role is required");

            user.Role = role;
            await _db.SaveChangesAsync();
            return Ok(new { user.Id, user.Username, user.Email, user.Role });
        }

        [HttpGet("auctions")]
        public async Task<IActionResult> GetAuctions() => Ok(await _db.Auctions.ToListAsync());

        [HttpPost("auctions/{id}/close")]
        public async Task<IActionResult> ForceCloseAuction(int id)
        {
            var auction = await _db.Auctions.FindAsync(id);
            if (auction == null) return NotFound();

            auction.IsClosed = true;
            await _db.SaveChangesAsync();
            return Ok(auction);
        }

        [HttpGet("bids")]
        public async Task<IActionResult> GetBids() =>
            Ok(await _db.Bids.OrderByDescending(b => b.PlacedAt).ToListAsync());

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _db.Users.FindAsync(id);
            if (user == null) return NotFound();

            _db.Users.Remove(user);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("auctions/{id}")]
        public async Task<IActionResult> DeleteAuction(int id)
        {
            var auction = await _db.Auctions.FindAsync(id);
            if (auction == null) return NotFound();

            // Delete related bids first to avoid foreign key constraints
            var bids = _db.Bids.Where(b => b.AuctionId == id);
            _db.Bids.RemoveRange(bids);

            _db.Auctions.Remove(auction);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
