using AuctionSystem.Api.Data;
using Microsoft.EntityFrameworkCore;

using online_auction_website.Services; // ADD THIS
using AuctionSystem.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database context
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ADD THIS: Register Email Service
builder.Services.AddScoped<IEmailService, EmailService>();

// Register the Auction Timer Background Service
builder.Services.AddHostedService<AuctionTimerService>();

// CORS configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");

// Add static files middleware to serve uploaded images
app.UseStaticFiles();

app.UseAuthorization();
app.MapControllers();

app.Run();
