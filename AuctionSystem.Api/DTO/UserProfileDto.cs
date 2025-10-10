using AuctionSystem.Api.Models;

namespace AuctionSystem.Api.DTOs
{
    public class UserProfileDto
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
        public List<Auction> Auctions { get; set; } = new();
        public List<Bid> Bids { get; set; } = new();
    }
}
