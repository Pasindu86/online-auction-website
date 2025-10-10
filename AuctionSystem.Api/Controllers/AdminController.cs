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
    }
}
