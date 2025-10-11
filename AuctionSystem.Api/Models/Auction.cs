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
        public string? ImageUrl { get; set; } // New property for image URL

    }
}
