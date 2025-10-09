using AuctionSystem.Api.Models;

using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;

namespace AuctionSystem.Api.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();

        public DbSet<Auction> Auctions => Set<Auction>();
        public DbSet<Bid> Bids => Set<Bid>();
        public DbSet<Order> Orders => Set<Order>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // User constraints
            modelBuilder.Entity<User>().HasIndex(u => u.Username).IsUnique();
            modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();

            // Auction relationships
            modelBuilder.Entity<Auction>()
                .HasOne<User>()
                .WithMany()
                .HasForeignKey(a => a.OwnerId)
                .OnDelete(DeleteBehavior.NoAction);

            // Bid relationships
            modelBuilder.Entity<Bid>()
                .HasOne<Auction>()
                .WithMany()
                .HasForeignKey(b => b.AuctionId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Bid>()
                .HasOne<User>()
                .WithMany()
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.NoAction);

            // Order relationships
            modelBuilder.Entity<Order>()
                .HasOne(o => o.Auction)
                .WithMany()
                .HasForeignKey(o => o.AuctionId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Order>()
                .HasOne(o => o.Winner)
                .WithMany()
                .HasForeignKey(o => o.WinnerId)
                .OnDelete(DeleteBehavior.NoAction);


        }
    }
}
