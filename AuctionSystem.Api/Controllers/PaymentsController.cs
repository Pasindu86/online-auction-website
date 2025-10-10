using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AuctionSystem.Api.Data;

namespace AuctionSystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        public PaymentsController(ApplicationDbContext db) => _db = db;

        [HttpGet("{paymentId}")]
        public async Task<IActionResult> GetPaymentDetails(int paymentId)
        {
            var transaction = await _db.PaymentTransactions.FindAsync(paymentId);
            if (transaction == null) return NotFound("Payment not found");

            var order = await _db.Orders.FindAsync(transaction.OrderId);
            var auction = await _db.Auctions.FindAsync(order?.AuctionId);

            var result = new
            {
                Reference = transaction.TransactionId,
                AuctionTitle = auction?.Title ?? "Unknown Auction",
                Amount = transaction.Amount,
                PaidAt = transaction.ProcessedAt,
                Status = transaction.Status,
                PaymentMethod = transaction.PaymentMethod
            };

            return Ok(result);
        }

        [HttpGet("transaction/{transactionId}")]
        public async Task<IActionResult> GetPaymentByTransactionId(string transactionId)
        {
            var transaction = await _db.PaymentTransactions
                .FirstOrDefaultAsync(pt => pt.TransactionId == transactionId);

            if (transaction == null) return NotFound("Transaction not found");

            var order = await _db.Orders.FindAsync(transaction.OrderId);
            var auction = await _db.Auctions.FindAsync(order?.AuctionId);

            var result = new
            {
                Reference = transaction.TransactionId,
                AuctionTitle = auction?.Title ?? "Unknown Auction",
                Amount = transaction.Amount,
                PaidAt = transaction.ProcessedAt,
                Status = transaction.Status,
                PaymentMethod = transaction.PaymentMethod
            };

            return Ok(result);
        }
    }
}