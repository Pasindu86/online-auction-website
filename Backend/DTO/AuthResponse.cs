namespace AuctionSystem.Api.DTOs
{
    public class AuthResponse
    {
        public int Id { get; set; }
        public string Username { get; set; } = default!;
        public string Email { get; set; } = default!;
        public string Role { get; set; } = default!; // "user" or "admin"
    }
}
