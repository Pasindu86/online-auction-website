using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AuctionSystem.Api.Data;
using AuctionSystem.Api.Models;

namespace AuctionSystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuctionsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public AuctionsController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() =>
            Ok(await _db.Auctions.AsNoTracking().ToListAsync());

        [HttpGet("active")]
        public async Task<IActionResult> GetActive()
        {
            // First update any expired auctions
            await UpdateExpiredAuctionsAsync();
            
            var now = DateTime.UtcNow;
            var activeAuctions = await _db.Auctions
                .Where(a => a.StartTime <= now && a.EndTime > now && !a.IsClosed)
                .OrderBy(a => a.EndTime)
                .AsNoTracking()
                .ToListAsync();
            
            return Ok(activeAuctions);
        }

        [HttpGet("upcoming")]
        public async Task<IActionResult> GetUpcoming()
        {
            var now = DateTime.UtcNow;
            var upcomingAuctions = await _db.Auctions
                .Where(a => a.StartTime > now && !a.IsClosed)
                .OrderBy(a => a.StartTime)
                .AsNoTracking()
                .ToListAsync();
            
            return Ok(upcomingAuctions);
        }

        [HttpGet("ended")]
        public async Task<IActionResult> GetEnded()
        {
            var now = DateTime.UtcNow;
            var endedAuctions = await _db.Auctions
                .Where(a => a.EndTime <= now || a.IsClosed)
                .OrderByDescending(a => a.EndTime)
                .AsNoTracking()
                .ToListAsync();
            
            return Ok(endedAuctions);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var auction = await _db.Auctions.FindAsync(id);
            if (auction == null) return NotFound();
            return Ok(auction);
        }

        [HttpGet("{id}/time-remaining")]
        public async Task<IActionResult> GetTimeRemaining(int id)
        {
            var auction = await _db.Auctions.FindAsync(id);
            if (auction == null) return NotFound();
            
            var now = DateTime.UtcNow;
            if (now > auction.EndTime)
            {
                return Ok(new { hasEnded = true, timeRemaining = (TimeSpan?)null });
            }
            
            var timeRemaining = auction.EndTime - now;
            return Ok(new 
            { 
                hasEnded = false, 
                timeRemaining = timeRemaining,
                totalSeconds = timeRemaining.TotalSeconds,
                formatted = FormatTimeSpan(timeRemaining)
            });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateAuctionRequest request)
        {
            try
            {
                if (request.StartingPrice < 0) 
                    return BadRequest("Starting price must be >= 0");

                // Validate timing
                if (request.StartTime < DateTime.UtcNow)
                    return BadRequest("Start time cannot be in the past");
                
                if (request.EndTime <= request.StartTime)
                    return BadRequest("End time must be after start time");

                var auction = new Auction
                {
                    Title = request.Title,
                    Description = request.Description,
                    StartingPrice = request.StartingPrice,
                    CurrentPrice = request.StartingPrice, // Set current price equal to starting price
                    OwnerId = request.OwnerId,
                    ImageUrl = request.ImageUrl,
                    StartTime = request.StartTime,
                    EndTime = request.EndTime,
                    CreatedAt = DateTime.UtcNow,
                    IsClosed = false
                };

                _db.Auctions.Add(auction);
                await _db.SaveChangesAsync();
                return Ok(auction);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error creating auction: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateAuctionRequest request)
        {
            var auction = await _db.Auctions.FindAsync(id);
            if (auction == null) return NotFound();
            if (auction.IsClosed) return BadRequest("Closed auctions cannot be updated");

            // Only allow updates if auction hasn't started yet
            var now = DateTime.UtcNow;
            if (now >= auction.StartTime)
                return BadRequest("Cannot update auction that has already started");

            // Validate new timing
            if (request.StartTime < DateTime.UtcNow)
                return BadRequest("Start time cannot be in the past");
            
            if (request.EndTime <= request.StartTime)
                return BadRequest("End time must be after start time");

            auction.Title = request.Title;
            auction.Description = request.Description;
            auction.StartingPrice = request.StartingPrice;
            auction.CurrentPrice = request.StartingPrice; // Reset current price if starting price changes
            auction.ImageUrl = request.ImageUrl;
            auction.StartTime = request.StartTime;
            auction.EndTime = request.EndTime;

            await _db.SaveChangesAsync();
            return Ok(auction);
        }

        [HttpPost("{id}/close")]
        public async Task<IActionResult> Close(int id)
        {
            try
            {
                var auction = await _db.Auctions.FindAsync(id);
                if (auction == null) return NotFound();
                if (auction.IsClosed) return BadRequest("Auction already closed");

                // Close the auction
                auction.IsClosed = true;

                // Find the winning bid
                var topBid = await _db.Bids
                    .Where(b => b.AuctionId == id)
                    .OrderByDescending(b => b.Amount)
                    .ThenByDescending(b => b.PlacedAt)
                    .FirstOrDefaultAsync();

                if (topBid != null)
                {
                    // Create order for winner
                    var existingOrder = await _db.Orders.FirstOrDefaultAsync(o => o.AuctionId == id);
                    if (existingOrder == null)
                    {
                        var order = new Order
                        {
                            AuctionId = id,
                            WinnerId = topBid.UserId,
                            FinalPrice = topBid.Amount,
                            OrderDate = DateTime.UtcNow,
                            Status = "Pending"
                        };
                        _db.Orders.Add(order);
                    }
                }

                await _db.SaveChangesAsync();

                return Ok(new
                {
                    auction.Id,
                    auction.Title,
                    auction.IsClosed,
                    HasWinner = topBid != null,
                    WinningBid = topBid?.Amount,
                    WinnerId = topBid?.UserId,
                    Message = topBid != null ? "Auction closed successfully!" : "Auction closed with no bids"
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error closing auction: {ex.Message}");
                return StatusCode(500, $"Failed to close auction: {ex.Message}");
            }
        }

        [HttpGet("{id}/winner")]
        public async Task<IActionResult> GetWinner(int id)
        {
            var auction = await _db.Auctions.FindAsync(id);
            if (auction == null) return NotFound();
            if (!auction.IsClosed) return BadRequest("Auction still active");

            var topBid = await _db.Bids.Where(b => b.AuctionId == id)
                .OrderByDescending(b => b.Amount)
                .ThenByDescending(b => b.PlacedAt)
                .FirstOrDefaultAsync();

            if (topBid == null)
                return Ok(new { hasWinner = false, message = "No bids placed" });

            var winner = await _db.Users.FindAsync(topBid.UserId);
            return Ok(new
            {
                hasWinner = true,
                winnerId = topBid.UserId,
                winnerUsername = winner?.Username ?? "Unknown",
                winnerEmail = winner?.Email ?? "Unknown",
                winningAmount = topBid.Amount,
                auctionTitle = auction.Title
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var auction = await _db.Auctions.FindAsync(id);
            if (auction == null) return NotFound();

            // Check if auction has any bids
            var hasBids = await _db.Bids.AnyAsync(b => b.AuctionId == id);
            if (hasBids)
            {
                return BadRequest("Cannot delete auction with existing bids");
            }

            // Delete the auction
            _db.Auctions.Remove(auction);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Auction deleted successfully" });
        }

        // Helper method to update expired auctions (replaces service functionality)
        private async Task UpdateExpiredAuctionsAsync()
        {
            var now = DateTime.UtcNow;
            var expiredAuctions = await _db.Auctions
                .Where(a => a.EndTime <= now && !a.IsClosed)
                .ToListAsync();

            foreach (var auction in expiredAuctions)
            {
                auction.IsClosed = true;
                
                // Create order for highest bidder if there are bids
                var topBid = await _db.Bids
                    .Where(b => b.AuctionId == auction.Id)
                    .OrderByDescending(b => b.Amount)
                    .ThenByDescending(b => b.PlacedAt)
                    .FirstOrDefaultAsync();

                if (topBid != null)
                {
                    var existingOrder = await _db.Orders
                        .FirstOrDefaultAsync(o => o.AuctionId == auction.Id);
                        
                    if (existingOrder == null)
                    {
                        var order = new Order
                        {
                            AuctionId = auction.Id,
                            WinnerId = topBid.UserId,
                            FinalPrice = topBid.Amount,
                            OrderDate = DateTime.UtcNow,
                            Status = "Pending"
                        };
                        _db.Orders.Add(order);
                    }
                }
            }

            if (expiredAuctions.Any())
            {
                await _db.SaveChangesAsync();
            }
        }

        private static string FormatTimeSpan(TimeSpan timeSpan)
        {
            if (timeSpan.TotalDays >= 1)
                return $"{(int)timeSpan.TotalDays}d {timeSpan.Hours}h {timeSpan.Minutes}m";
            else if (timeSpan.TotalHours >= 1)
                return $"{timeSpan.Hours}h {timeSpan.Minutes}m";
            else
                return $"{timeSpan.Minutes}m {timeSpan.Seconds}s";
        }
    }

    public class CreateAuctionRequest
    {
        public string Title { get; set; } = default!;
        public string Description { get; set; } = default!;
        public decimal StartingPrice { get; set; }
        public int OwnerId { get; set; }
        public string? ImageUrl { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
    }

    public class UpdateAuctionRequest
    {
        public string Title { get; set; } = default!;
        public string Description { get; set; } = default!;
        public decimal StartingPrice { get; set; }
        public string? ImageUrl { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
    }
}
