using online_auction_website.Models;
namespace AuctionSystem.Api.Models
{
    public class PaymentTransaction
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public int UserId { get; set; }
        public decimal Amount { get; set; }
        public DateTime ProcessedAt { get; set; }
        public string Status { get; set; } = "Success"; // Success, Failed, Pending
        public string PaymentMethod { get; set; } = default!; // CreditCard, PayPal, BankTransfer
        public string CardLastFour { get; set; } = ""; // For display purposes
        public string TransactionId { get; set; } = default!;

        // Navigation properties
        public virtual Order? Order { get; set; }
        public virtual User? User { get; set; }
    }
}