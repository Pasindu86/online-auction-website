using AuctionSystem.Api.Data;
using AuctionSystem.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace AuctionSystem.Api.Services
{
    public class AuctionTimerService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<AuctionTimerService> _logger;

        public AuctionTimerService(IServiceProvider serviceProvider, ILogger<AuctionTimerService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Auction Timer Service started.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await CheckAndCloseExpiredAuctions();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred while checking expired auctions.");
                }

                // Check every 30 seconds
                await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
            }

            _logger.LogInformation("Auction Timer Service stopped.");
        }

        private async Task CheckAndCloseExpiredAuctions()
        {
            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var now = DateTime.UtcNow;
            var expiredAuctions = await dbContext.Auctions
                .Where(a => a.EndTime <= now && !a.IsClosed)
                .ToListAsync();

            if (expiredAuctions.Any())
            {
                _logger.LogInformation($"Found {expiredAuctions.Count} expired auction(s) to close.");

                foreach (var auction in expiredAuctions)
                {
                    try
                    {
                        _logger.LogInformation($"Closing auction {auction.Id}: {auction.Title}");
                        
                        auction.IsClosed = true;

                        // Find the winning bid
                        var topBid = await dbContext.Bids
                            .Where(b => b.AuctionId == auction.Id)
                            .OrderByDescending(b => b.Amount)
                            .ThenByDescending(b => b.PlacedAt)
                            .FirstOrDefaultAsync();

                        if (topBid != null)
                        {
                            // Create order for winner if it doesn't exist
                            var existingOrder = await dbContext.Orders
                                .FirstOrDefaultAsync(o => o.AuctionId == auction.Id);

                            if (existingOrder == null)
                            {
                                var order = new Order
                                {
                                    AuctionId = auction.Id,
                                    WinnerId = topBid.UserId,
                                    FinalPrice = topBid.Amount,
                                    OrderDate = DateTime.UtcNow,
                                    Status = "Pending"
                                };
                                dbContext.Orders.Add(order);
                                
                                _logger.LogInformation($"Created order for winner (User {topBid.UserId}) of auction {auction.Id}");
                            }
                        }
                        else
                        {
                            _logger.LogInformation($"Auction {auction.Id} closed with no bids.");
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Error closing auction {auction.Id}");
                    }
                }

                await dbContext.SaveChangesAsync();
                _logger.LogInformation("Expired auctions processed successfully.");
            }
        }
    }
}
