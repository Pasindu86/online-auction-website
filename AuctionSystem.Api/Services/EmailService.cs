using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using System.Globalization;

namespace online_auction_website.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly string _fromEmail;
        private readonly string _fromName;
        private readonly string _smtpHost;
        private readonly int _smtpPort;
        private readonly string _smtpUsername;
        private readonly string _smtpPassword;
        private readonly string _frontendUrl;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
            _fromEmail = _configuration["EmailSettings:FromEmail"];
            _fromName = _configuration["EmailSettings:FromName"];
            _smtpHost = _configuration["EmailSettings:SmtpHost"];
            _smtpPort = int.Parse(_configuration["EmailSettings:SmtpPort"]);
            _smtpUsername = _configuration["EmailSettings:SmtpUsername"];
            _smtpPassword = _configuration["EmailSettings:SmtpPassword"];
            _frontendUrl = _configuration["FrontendUrl"];
        }

        public async Task SendVerificationEmailAsync(string toEmail, string userName, string verificationToken)
        {
            var verificationUrl = $"{_frontendUrl}/verify-email?token={verificationToken}";

            var subject = "Verify Your Email - Online Auction System";
            var body = $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background-color: #8B0000; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
                        .content {{ background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }}
                        .button {{ display: inline-block; padding: 12px 30px; background-color: #8B0000; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                        .footer {{ text-align: center; margin-top: 20px; color: #777; font-size: 12px; }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h1>Welcome to Online Auction System!</h1>
                        </div>
                        <div class='content'>
                            <h2>Hello {userName},</h2>
                            <p>Thank you for registering with us. Please verify your email address to complete your registration.</p>
                            <p>Click the button below to verify your email:</p>
                            <a href='{verificationUrl}' class='button'>Verify Email Address</a>
                            <p>Or copy and paste this link into your browser:</p>
                            <p style='word-break: break-all; color: #8B0000;'>{verificationUrl}</p>
                            <p><strong>This link will expire in 24 hours.</strong></p>
                            <p>If you didn't create an account with us, please ignore this email.</p>
                        </div>
                        <div class='footer'>
                            <p>&copy; 2025 Online Auction System. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            ";

            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendPasswordResetEmailAsync(string toEmail, string userName, string resetToken)
        {
            var resetUrl = $"{_frontendUrl}/reset-password?token={resetToken}";

            var subject = "Password Reset - Online Auction System";
            var body = $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background-color: #8B0000; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
                        .content {{ background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }}
                        .button {{ display: inline-block; padding: 12px 30px; background-color: #8B0000; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h1>Password Reset Request</h1>
                        </div>
                        <div class='content'>
                            <h2>Hello {userName},</h2>
                            <p>We received a request to reset your password.</p>
                            <a href='{resetUrl}' class='button'>Reset Password</a>
                            <p><strong>This link will expire in 1 hour.</strong></p>
                        </div>
                    </div>
                </body>
                </html>
            ";

            await SendEmailAsync(toEmail, subject, body);
        }

        public async Task SendAuctionWonEmailAsync(string toEmail, string userName, string auctionTitle, decimal winningAmount, int auctionId)
        {
            var subject = "You Won an Auction - Online Auction System";
            var formattedAmount = winningAmount.ToString("C2", CultureInfo.GetCultureInfo("en-US"));
            var effectivePaymentUrl = $"{_frontendUrl}/payment?auctionId={auctionId}";

            var body = $@"
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                        .header {{ background-color: #8B0000; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
                        .content {{ background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }}
                        .button {{ display: inline-block; padding: 12px 30px; background-color: #8B0000; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
                        .footer {{ text-align: center; margin-top: 20px; color: #777; font-size: 12px; }}
                    </style>
                </head>
                <body>
                    <div class='container'>
                        <div class='header'>
                            <h1>Congratulations, {userName}!</h1>
                        </div>
                        <div class='content'>
                            <h2>You won the auction: {auctionTitle}</h2>
                            <p>Great news! You placed the highest bid and won the auction.</p>
                            <p><strong>Winning Amount:</strong> {formattedAmount}</p>
                            <p>Please proceed to the payment section to complete your purchase.</p>
                            <a href='{effectivePaymentUrl}' class='button'>Go to Payment</a>
                            <p>If the button above does not work, copy and paste this link into your browser:</p>
                            <p style='word-break: break-all; color: #8B0000;'>{effectivePaymentUrl}</p>
                        </div>
                        <div class='footer'>
                            <p>&copy; 2025 Online Auction System. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            ";

            await SendEmailAsync(toEmail, subject, body);
        }

        private async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            try
            {
                using var message = new MailMessage();
                message.From = new MailAddress(_fromEmail, _fromName);
                message.To.Add(new MailAddress(toEmail));
                message.Subject = subject;
                message.Body = body;
                message.IsBodyHtml = true;

                using var smtpClient = new SmtpClient(_smtpHost, _smtpPort);
                smtpClient.Credentials = new NetworkCredential(_smtpUsername, _smtpPassword);
                smtpClient.EnableSsl = true;

                await smtpClient.SendMailAsync(message);
            }
            catch (Exception ex)
            {
                // Log the error (implement logging as needed)
                throw new Exception($"Failed to send email: {ex.Message}");
            }
        }
    }
}
