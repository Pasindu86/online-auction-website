namespace AuctionSystem.Api.DTOs
{
    public class LoginRequest
    {
        public string Email { get; set; } = default!;
        public string PasswordHash { get; set; } = default!;
    }
}
