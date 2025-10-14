using AuctionSystem.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using online_auction_website.Models;
using online_auction_website.Services;
using System.Security.Cryptography;
using System.Text;

namespace online_auction_website.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;

        public AuthController(ApplicationDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        // UPDATED: Register endpoint with email verification
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] User user)
        {
            try
            {
                // Check if email already exists
                if (await _context.Users.AnyAsync(u => u.Email == user.Email))
                {
                    return BadRequest(new { message = "Email already registered" });
                }

                // Check if username already exists
                if (await _context.Users.AnyAsync(u => u.Username == user.Username))
                {
                    return BadRequest(new { message = "Username already taken" });
                }

                // Generate email verification token
                user.EmailVerificationToken = GenerateVerificationToken();
                user.EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(24);
                user.IsEmailVerified = false;
                user.Role = "user";
                user.CreatedAt = DateTime.UtcNow;

                // Hash the password
                user.PasswordHash = HashPassword(user.PasswordHash);

                // Save user to database
                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                // Send verification email
                await _emailService.SendVerificationEmailAsync(
                    user.Email,
                    user.Username,
                    user.EmailVerificationToken
                );

                return Ok(new
                {
                    message = "Registration successful! Please check your email to verify your account.",
                    userId = user.Id,
                    email = user.Email
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Registration failed", error = ex.Message });
            }
        }

        // NEW: Verify email endpoint
        [HttpPost("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailRequest request)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.EmailVerificationToken == request.Token);

                if (user == null)
                {
                    return BadRequest(new { message = "Invalid verification token" });
                }

                if (user.EmailVerificationTokenExpiry < DateTime.UtcNow)
                {
                    return BadRequest(new { message = "Verification token has expired" });
                }

                if (user.IsEmailVerified)
                {
                    return BadRequest(new { message = "Email already verified" });
                }

                // Mark email as verified
                user.IsEmailVerified = true;
                user.EmailVerificationToken = null;
                user.EmailVerificationTokenExpiry = null;

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Email verified successfully! You can now login.",
                    username = user.Username,
                    email = user.Email
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Verification failed", error = ex.Message });
            }
        }

        // NEW: Resend verification email
        [HttpPost("resend-verification")]
        public async Task<IActionResult> ResendVerification([FromBody] ResendVerificationRequest request)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == request.Email);

                if (user == null)
                {
                    return BadRequest(new { message = "Email not found" });
                }

                if (user.IsEmailVerified)
                {
                    return BadRequest(new { message = "Email already verified" });
                }

                // Generate new token
                user.EmailVerificationToken = GenerateVerificationToken();
                user.EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(24);

                await _context.SaveChangesAsync();

                // Send verification email
                await _emailService.SendVerificationEmailAsync(
                    user.Email,
                    user.Username,
                    user.EmailVerificationToken
                );

                return Ok(new { message = "Verification email sent successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to resend verification", error = ex.Message });
            }
        }

        // UPDATED: Login endpoint - check email verification
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest loginRequest)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == loginRequest.Email);

                if (user == null || !VerifyPassword(loginRequest.PasswordHash, user.PasswordHash))
                {
                    return Unauthorized(new { message = "Invalid email or password" });
                }

                // Check if email is verified
                if (!user.IsEmailVerified)
                {
                    return Unauthorized(new
                    {
                        message = "Please verify your email before logging in",
                        emailNotVerified = true,
                        email = user.Email
                    });
                }

                return Ok(new AuthResponse
                {
                    Id = user.Id,
                    Username = user.Username,
                    Email = user.Email,
                    Role = user.Role,
                    IsEmailVerified = user.IsEmailVerified
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Login failed", error = ex.Message });
            }
        }

        // Helper methods
        private string GenerateVerificationToken()
        {
            var randomBytes = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomBytes);
            return Convert.ToBase64String(randomBytes)
                .Replace("+", "")
                .Replace("/", "")
                .Replace("=", "");
        }

        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }

        private bool VerifyPassword(string enteredPassword, string storedHash)
        {
            var enteredHash = HashPassword(enteredPassword);
            return enteredHash == storedHash;
        }
    }

    // Request DTOs
    public class LoginRequest
    {
        public string Email { get; set; }
        public string PasswordHash { get; set; }
    }

    public class VerifyEmailRequest
    {
        public string Token { get; set; }
    }

    public class ResendVerificationRequest
    {
        public string Email { get; set; }
    }

    public class AuthResponse
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
        public bool IsEmailVerified { get; set; }
    }
}
