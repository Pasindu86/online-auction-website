using Microsoft.AspNetCore.Mvc;

namespace AuctionSystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UploadsController : ControllerBase
    {
        private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
        { ".jpg", ".jpeg", ".png", ".gif", ".webp" };

        private readonly IWebHostEnvironment _env;
        private readonly ILogger<UploadsController> _logger;

        public UploadsController(IWebHostEnvironment env, ILogger<UploadsController> logger)
        {
            _env = env;
            _logger = logger;
        }

        [HttpPost]
        [RequestSizeLimit(10_000_000)] // 10 MB
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Upload(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");

            var ext = Path.GetExtension(file.FileName);
            if (!AllowedExtensions.Contains(ext))
                return BadRequest("Unsupported file type");

            var uploadsDir = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
            if (!Directory.Exists(uploadsDir))
                Directory.CreateDirectory(uploadsDir);

            var safeFileName = $"{Guid.NewGuid():N}{ext}";
            var destinationPath = Path.Combine(uploadsDir, safeFileName);

            await using (var stream = System.IO.File.Create(destinationPath))
            {
                await file.CopyToAsync(stream);
            }

            // Return a relative path that can be served by static files
            var url = $"/uploads/{safeFileName}";
            return Ok(new { url });
        }
    }
}