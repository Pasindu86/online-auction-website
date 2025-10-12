namespace AuctionSystem.Api.Models
{
    public class Auction
    {
        public int Id { get; set; }
        public string Title { get; set; } = default!;
        public string Description { get; set; } = default!;
        public decimal StartingPrice { get; set; }
        public decimal CurrentPrice { get; set; }
        public bool IsClosed { get; set; }
        public int OwnerId { get; set; }
        public string? ImageUrl { get; set; }
        
        // New timing properties
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public DateTime CreatedAt { get; set; }
        
        // Computed properties
        public bool IsActive => DateTime.UtcNow >= StartTime && DateTime.UtcNow <= EndTime && !IsClosed;
        public bool HasStarted => DateTime.UtcNow >= StartTime;
        public bool HasEnded => DateTime.UtcNow > EndTime;
        public TimeSpan? TimeRemaining => HasEnded ? null : EndTime - DateTime.UtcNow;
    }
}
