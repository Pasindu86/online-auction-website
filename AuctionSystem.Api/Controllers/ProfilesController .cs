using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AuctionSystem.Api.Data;
using AuctionSystem.Api.DTOs;

namespace AuctionSystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProfilesController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        public ProfilesController(ApplicationDbContext db) => _db = db;

        [HttpGet]
        public async Task<IActionResult> GetAllUsers() =>
            Ok(await _db.Users.Select(u => new { u.Id, u.Username, u.Email, u.Role }).ToListAsync());

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetProfile(int userId)
        {
            var user = await _db.Users.FindAsync(userId);
            if (user == null) return NotFound();

            var auctions = await _db.Auctions.Where(a => a.OwnerId == userId).ToListAsync();
            var bids = await _db.Bids.Where(b => b.UserId == userId).OrderByDescending(b => b.PlacedAt).ToListAsync();

            return Ok(new UserProfileDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role,
                Auctions = auctions,
                Bids = bids
            });
        }
    }
}
