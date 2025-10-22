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
            if (auction == null)
                return BadRequest("Auction not found");
            
            if (auction.IsClosed)
                return BadRequest("Auction is closed");

            // Check if auction has started
            var now = DateTime.UtcNow;
            if (now < auction.StartTime)
                return BadRequest("Auction has not started yet");

            // Check if auction has ended
            if (now > auction.EndTime)
                return BadRequest("Auction has already ended");

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

            var bids = await (from b in _db.Bids
                             join u in _db.Users on b.UserId equals u.Id
                             where b.AuctionId == auctionId
                             orderby b.Amount descending, b.PlacedAt descending
                             select new
                             {
                                 b.Id,
                                 b.AuctionId,
                                 b.UserId,
                                 b.Amount,
                                 b.PlacedAt,
                                 UserName = u.Username,
                                 UserEmail = u.Email
                             }).ToListAsync();

            return Ok(bids);
        }
    }
}
