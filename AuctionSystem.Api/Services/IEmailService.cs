namespace online_auction_website.Services
{
    public interface IEmailService
    {
        Task SendVerificationEmailAsync(string toEmail, string userName, string verificationToken);
        Task SendPasswordResetEmailAsync(string toEmail, string userName, string resetToken);
        Task SendAuctionWonEmailAsync(string toEmail, string userName, string auctionTitle, decimal winningAmount, int auctionId);
    }
}
