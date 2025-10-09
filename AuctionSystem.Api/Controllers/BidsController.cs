using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AuctionSystem.Api.Data;
using AuctionSystem.Api.Models;

namespace AuctionSystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BidsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        public BidsController(ApplicationDbContext db) => _db = db;

        [HttpPost]
        public async Task<IActionResult> PlaceBid([FromBody] Bid bid)
        {
            var auction = await _db.Auctions.FindAsync(bid.AuctionId);
            if (auction == null || auction.IsClosed)
                return BadRequest("Auction not found or is closed");

            if (!await _db.Users.AnyAsync(u => u.Id == bid.UserId))
                return BadRequest("User not found");

            if (bid.Amount <= auction.CurrentPrice)
                return BadRequest("Bid must be higher than current price");

            bid.PlacedAt = DateTime.UtcNow;
            auction.CurrentPrice = bid.Amount;

            _db.Bids.Add(bid);
            await _db.SaveChangesAsync();
            return Ok(bid);
        }

        [HttpGet("auction/{auctionId}")]
        public async Task<IActionResult> GetBidsForAuction(int auctionId)
        {
            if (!await _db.Auctions.AnyAsync(a => a.Id == auctionId))
                return NotFound();

            var bids = await _db.Bids
                .Where(b => b.AuctionId == auctionId)
                .OrderByDescending(b => b.Amount)
                .ThenByDescending(b => b.PlacedAt)
                .ToListAsync();

            return Ok(bids);
        }
    }
}
