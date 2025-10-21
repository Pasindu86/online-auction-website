using online_auction_website.Models;
using System.ComponentModel.DataAnnotations.Schema;

namespace AuctionSystem.Api.Models
{
    public class Bid
    {
        public int Id { get; set; }
        public int AuctionId { get; set; }
        public int UserId { get; set; }
        public decimal Amount { get; set; }
        public DateTime PlacedAt { get; set; }

        // Navigation properties
        [ForeignKey("UserId")]
        public User? User { get; set; }
    }
}
