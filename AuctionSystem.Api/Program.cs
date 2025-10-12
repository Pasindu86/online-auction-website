namespace AuctionSystem.Api
{
    using Microsoft.EntityFrameworkCore;
    using AuctionSystem.Api.Data;
    using AuctionSystem.Api.Models;
    using System.Text.Json;

    public class Program
    {
        public static void Main(string[] args)
        {
            var app = CreateWebApplication(args);
            app.Run();
        }

        public static WebApplication CreateWebApplication(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            // EF Core with SQL Server (bidDB)
            builder.Services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            // CORS: allow local static site during development
            const string DevCors = "DevCors";
            builder.Services.AddCors(options =>
            {
                options.AddPolicy(DevCors, policy =>
                {
                    policy
                        .WithOrigins(
                            "http://localhost:5500",
                            "http://127.0.0.1:5500",
                            "http://localhost:3000",
                            "http://localhost:3001",
                            "https://localhost:3000")
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials();
                });
            });

            var app = builder.Build();

            // Ensure database (apply migrations) at startup
            using (var scope = app.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                db.Database.Migrate();
            }

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            // Comment out HTTPS redirection for development to avoid SSL issues
            // app.UseHttpsRedirection();

            app.UseCors(DevCors); // enable dev CORS policy so the frontend can call the API

            // Enable static file serving for uploaded images
            app.UseStaticFiles();

            app.UseAuthorization();

            app.MapControllers();

            return app;
        }
    }
}
