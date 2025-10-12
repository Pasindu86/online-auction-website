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

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var auction = await _db.Auctions.FindAsync(id);
            if (auction == null) return NotFound();
            return Ok(auction);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Auction auction)
        {
            if (auction.StartingPrice < 0) return BadRequest("Starting price must be >= 0");
            auction.CurrentPrice = auction.StartingPrice;
            auction.IsClosed = false;
            _db.Auctions.Add(auction);
            await _db.SaveChangesAsync();
            return Ok(auction);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] Auction updated)
        {
            var auction = await _db.Auctions.FindAsync(id);
            if (auction == null) return NotFound();
            if (auction.IsClosed) return BadRequest("Closed auctions cannot be updated");

            auction.Title = updated.Title;
            auction.Description = updated.Description;
            auction.StartingPrice = updated.StartingPrice;
            auction.ImageUrl = updated.ImageUrl; // Update image URL
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
    }
}
