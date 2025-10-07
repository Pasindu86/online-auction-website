using Microsoft.EntityFrameworkCore;
using AuctionSystem.Api.Data;
using AuctionSystem.Api.Models;
using System.Text.Json; // For camelCase JSON

var builder = WebApplication.CreateBuilder(args);

// Add controllers with camelCase JSON to match frontend expectations
builder.Services.AddControllers().AddJsonOptions(o =>
{
    o.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
});

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
                // React development server (default and common ports)
                "http://localhost:3000",
                "http://localhost:3001",
                "http://localhost:3002",
                "http://localhost:3003",
                // Vite development server (if using Vite with React)
                "http://localhost:5173",
                "http://localhost:5174",
                // Next.js development server
                "http://localhost:3000",
                // Create React App on alternative ports
                "http://localhost:8080",
                // Include 127.0.0.1 variants for React default
                "http://127.0.0.1:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials(); // Important for React apps that need to send cookies/auth tokens
    });
});

var app = builder.Build();

// Ensure database (apply migrations) at startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.Migrate();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors(DevCors);
app.MapControllers();
app.Run();
