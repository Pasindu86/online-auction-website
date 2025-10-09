namespace AuctionSystem.Api.Models
{
    public class Order
    {
        public int Id { get; set; }
        public int AuctionId { get; set; }
        public int WinnerId { get; set; }
        public decimal FinalPrice { get; set; }
        public DateTime OrderDate { get; set; }
        public string Status { get; set; } = "Pending";
        public string ShippingAddress { get; set; } = "";
        public string PaymentMethod { get; set; } = "";
        public string PaymentReference { get; set; } = "";

        // Navigation properties
        public virtual Auction? Auction { get; set; }
        public virtual User? Winner { get; set; }

    }
}
