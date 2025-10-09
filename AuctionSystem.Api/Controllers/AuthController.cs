using AuctionSystem.Api.Data;
using AuctionSystem.Api.DTOs;
using AuctionSystem.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AuctionSystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public AuthController(ApplicationDbContext db) => _db = db;

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] User user)
        {
            if (user == null || string.IsNullOrWhiteSpace(user.Username) || 
                string.IsNullOrWhiteSpace(user.Email) || string.IsNullOrWhiteSpace(user.PasswordHash))
                return BadRequest("All fields are required");

            if (await _db.Users.AnyAsync(u => u.Username == user.Username || u.Email == user.Email))
                return BadRequest("Username or email already exists");

            user.Role = string.IsNullOrWhiteSpace(user.Role) ? "user" : user.Role;
            
            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return Ok(new AuthResponse
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.PasswordHash))
                return BadRequest("Email and password are required");

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email && u.PasswordHash == request.PasswordHash);
            
            if (user == null)
                return Unauthorized("Invalid email or password");

            return Ok(new AuthResponse 
            { 
                Id = user.Id, 
                Username = user.Username, 
                Email = user.Email, 
                Role = user.Role 
            });
        }

        
    }
}
