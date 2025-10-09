using AuctionSystem.Api.Models;

using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;

namespace AuctionSystem.Api.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
     

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // User constraints
            modelBuilder.Entity<User>().HasIndex(u => u.Username).IsUnique();
            modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();

        
        }
    }
}
