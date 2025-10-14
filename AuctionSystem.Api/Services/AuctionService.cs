//using AuctionSystem.Api.Data;
//using AuctionSystem.Api.Models;
//using Microsoft.EntityFrameworkCore;

//namespace AuctionSystem.Api.Services
//{
//    public interface IAuctionService
//    {
//        Task<Auction> CreateAuctionAsync(Auction auction);
//        Task<Auction?> GetAuctionByIdAsync(int id);
//        Task<IEnumerable<Auction>> GetActiveAuctionsAsync();
//        Task<IEnumerable<Auction>> GetUpcomingAuctionsAsync();
//        Task<IEnumerable<Auction>> GetEndedAuctionsAsync();
//        Task UpdateExpiredAuctionsAsync();
//        Task<bool> CanPlaceBidAsync(int auctionId);
//        Task<TimeSpan?> GetTimeRemainingAsync(int auctionId);
//    }

//    public class AuctionService : IAuctionService
//    {
//        private readonly ApplicationDbContext _context;

//        public AuctionService(ApplicationDbContext context)
//        {
//            _context = context;
//        }

//        public async Task<Auction> CreateAuctionAsync(Auction auction)
//        {
//            // Set creation time
//            auction.CreatedAt = DateTime.UtcNow;
            
//            // Validate timing
//            if (auction.StartTime < DateTime.UtcNow)
//            {
//                throw new InvalidOperationException("Start time cannot be in the past");
//            }
            
//            if (auction.EndTime <= auction.StartTime)
//            {
//                throw new InvalidOperationException("End time must be after start time");
//            }

//            // Set initial values
//            auction.CurrentPrice = auction.StartingPrice;
//            auction.IsClosed = false;

//            _context.Auctions.Add(auction);
//            await _context.SaveChangesAsync();
//            return auction;
//        }

//        public async Task<Auction?> GetAuctionByIdAsync(int id)
//        {
//            return await _context.Auctions.FindAsync(id);
//        }

//        public async Task<IEnumerable<Auction>> GetActiveAuctionsAsync()
//        {
//            var now = DateTime.UtcNow;
//            return await _context.Auctions
//                .Where(a => a.StartTime <= now && a.EndTime > now && !a.IsClosed)
//                .OrderBy(a => a.EndTime)
//                .ToListAsync();
//        }

//        public async Task<IEnumerable<Auction>> GetUpcomingAuctionsAsync()
//        {
//            var now = DateTime.UtcNow;
//            return await _context.Auctions
//                .Where(a => a.StartTime > now && !a.IsClosed)
//                .OrderBy(a => a.StartTime)
//                .ToListAsync();
//        }

//        public async Task<IEnumerable<Auction>> GetEndedAuctionsAsync()
//        {
//            var now = DateTime.UtcNow;
//            return await _context.Auctions
//                .Where(a => a.EndTime <= now || a.IsClosed)
//                .OrderByDescending(a => a.EndTime)
//                .ToListAsync();
//        }

//        public async Task UpdateExpiredAuctionsAsync()
//        {
//            var now = DateTime.UtcNow;
//            var expiredAuctions = await _context.Auctions
//                .Where(a => a.EndTime <= now && !a.IsClosed)
//                .ToListAsync();

//            foreach (var auction in expiredAuctions)
//            {
//                auction.IsClosed = true;
                
//                // Create order for highest bidder if there are bids
//                var topBid = await _context.Bids
//                    .Where(b => b.AuctionId == auction.Id)
//                    .OrderByDescending(b => b.Amount)
//                    .ThenByDescending(b => b.PlacedAt)
//                    .FirstOrDefaultAsync();

//                if (topBid != null)
//                {
//                    var existingOrder = await _context.Orders
//                        .FirstOrDefaultAsync(o => o.AuctionId == auction.Id);
                        
//                    if (existingOrder == null)
//                    {
//                        var order = new Order
//                        {
//                            AuctionId = auction.Id,
//                            WinnerId = topBid.UserId,
//                            FinalPrice = topBid.Amount,
//                            OrderDate = DateTime.UtcNow,
//                            Status = "Pending"
//                        };
//                        _context.Orders.Add(order);
//                    }
//                }
//            }

//            await _context.SaveChangesAsync();
//        }

//        public async Task<bool> CanPlaceBidAsync(int auctionId)
//        {
//            var auction = await GetAuctionByIdAsync(auctionId);
//            if (auction == null) return false;

//            var now = DateTime.UtcNow;
//            return now >= auction.StartTime && now <= auction.EndTime && !auction.IsClosed;
//        }

//        public async Task<TimeSpan?> GetTimeRemainingAsync(int auctionId)
//        {
//            var auction = await GetAuctionByIdAsync(auctionId);
//            if (auction == null || auction.HasEnded) return null;

//            return auction.TimeRemaining;
//        }
//    }
//}