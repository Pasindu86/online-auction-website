using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;

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
                    <meta charset='UTF-8'>
                    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                    <style>
                        body {{ 
                            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
                            line-height: 1.6; 
                            color: #1e293b; 
                            background: linear-gradient(135deg, #1e3a8a 0%, #312e81 50%, #3b82f6 100%);
                            margin: 0;
                            padding: 40px 20px;
                        }}
                        .email-wrapper {{
                            max-width: 600px;
                            margin: 0 auto;
                            background: white;
                            border-radius: 24px;
                            overflow: hidden;
                            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                        }}
                        .header {{ 
                            background: linear-gradient(135deg, #1e3a8a 0%, #312e81 50%, #3b82f6 100%);
                            color: white; 
                            padding: 48px 40px; 
                            text-align: center;
                        }}
                        .header h1 {{
                            margin: 0;
                            font-size: 32px;
                            font-weight: 800;
                            letter-spacing: -0.5px;
                        }}
                        .icon-badge {{
                            display: inline-block;
                            width: 80px;
                            height: 80px;
                            background: rgba(255, 255, 255, 0.15);
                            backdrop-filter: blur(10px);
                            border-radius: 20px;
                            margin-bottom: 20px;
                            line-height: 80px;
                            font-size: 40px;
                        }}
                        .content {{ 
                            padding: 48px 40px;
                            background: white;
                        }}
                        .content h2 {{
                            color: #1e293b;
                            font-size: 24px;
                            font-weight: 700;
                            margin: 0 0 16px 0;
                        }}
                        .content p {{
                            color: #475569;
                            font-size: 16px;
                            line-height: 1.7;
                            margin: 0 0 16px 0;
                        }}
                        .highlight-box {{
                            background: linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%);
                            border: 2px solid #bfdbfe;
                            border-radius: 16px;
                            padding: 24px;
                            margin: 24px 0;
                        }}
                        .highlight-box p {{
                            margin: 0;
                            color: #1e3a8a;
                            font-weight: 600;
                        }}
                        .button {{ 
                            display: inline-block; 
                            padding: 16px 40px;
                            background: linear-gradient(135deg, #1e3a8a 0%, #312e81 50%, #1e40af 100%);
                            color: white !important;
                            text-decoration: none; 
                            border-radius: 12px;
                            margin: 24px 0;
                            font-weight: 700;
                            font-size: 16px;
                            box-shadow: 0 10px 25px -5px rgba(30, 58, 138, 0.4);
                            transition: all 0.3s ease;
                        }}
                        .button:hover {{
                            transform: translateY(-2px);
                            box-shadow: 0 15px 30px -5px rgba(30, 58, 138, 0.5);
                        }}
                        .link-box {{
                            background: #f8fafc;
                            border: 2px solid #e2e8f0;
                            border-radius: 12px;
                            padding: 16px;
                            margin: 16px 0;
                            word-break: break-all;
                        }}
                        .link-box a {{
                            color: #3b82f6;
                            text-decoration: none;
                            font-size: 14px;
                        }}
                        .footer {{ 
                            text-align: center; 
                            padding: 32px 40px;
                            background: #f8fafc;
                            border-top: 2px solid #e2e8f0;
                        }}
                        .footer p {{
                            color: #64748b;
                            font-size: 13px;
                            margin: 4px 0;
                        }}
                        .divider {{
                            height: 1px;
                            background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
                            margin: 24px 0;
                        }}
                        strong {{
                            color: #0f172a;
                            font-weight: 700;
                        }}
                    </style>
                </head>
                <body>
                    <div class='email-wrapper'>
                        <div class='header'>
                            <div class='icon-badge'>🎯</div>
                            <h1>Welcome to Our Auction!</h1>
                        </div>
                        <div class='content'>
                            <h2>Hello {userName}! 👋</h2>
                            <p>Thank you for joining our online auction platform. We're excited to have you as part of our community!</p>
                            
                            <div class='highlight-box'>
                                <p>⚡ To get started, please verify your email address by clicking the button below:</p>
                            </div>

                            <div style='text-align: center;'>
                                <a href='{verificationUrl}' class='button'>✓ Verify Email Address</a>
                            </div>

                            <div class='divider'></div>

                            <p style='font-size: 14px; color: #64748b;'>Or copy and paste this link into your browser:</p>
                            <div class='link-box'>
                                <a href='{verificationUrl}'>{verificationUrl}</a>
                            </div>

                            <div class='highlight-box' style='background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%); border-color: #fbbf24;'>
                                <p style='color: #92400e;'>⏰ This verification link will expire in 24 hours.</p>
                            </div>

                            <p style='font-size: 14px; color: #64748b; margin-top: 24px;'>
                                If you didn't create an account with us, please ignore this email and no action is required.
                            </p>
                        </div>
                        <div class='footer'>
                            <p style='font-weight: 600; color: #475569;'>Online Auction System</p>
                            <p>&copy; 2025 All rights reserved.</p>
                            <p>Your trusted platform for online auctions</p>
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
                    <meta charset='UTF-8'>
                    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
                    <style>
                        body {{ 
                            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
                            line-height: 1.6; 
                            color: #1e293b; 
                            background: linear-gradient(135deg, #1e3a8a 0%, #312e81 50%, #3b82f6 100%);
                            margin: 0;
                            padding: 40px 20px;
                        }}
                        .email-wrapper {{
                            max-width: 600px;
                            margin: 0 auto;
                            background: white;
                            border-radius: 24px;
                            overflow: hidden;
                            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                        }}
                        .header {{ 
                            background: linear-gradient(135deg, #1e3a8a 0%, #312e81 50%, #3b82f6 100%);
                            color: white; 
                            padding: 48px 40px; 
                            text-align: center;
                        }}
                        .header h1 {{
                            margin: 0;
                            font-size: 32px;
                            font-weight: 800;
                            letter-spacing: -0.5px;
                        }}
                        .icon-badge {{
                            display: inline-block;
                            width: 80px;
                            height: 80px;
                            background: rgba(255, 255, 255, 0.15);
                            backdrop-filter: blur(10px);
                            border-radius: 20px;
                            margin-bottom: 20px;
                            line-height: 80px;
                            font-size: 40px;
                        }}
                        .content {{ 
                            padding: 48px 40px;
                            background: white;
                        }}
                        .content h2 {{
                            color: #1e293b;
                            font-size: 24px;
                            font-weight: 700;
                            margin: 0 0 16px 0;
                        }}
                        .content p {{
                            color: #475569;
                            font-size: 16px;
                            line-height: 1.7;
                            margin: 0 0 16px 0;
                        }}
                        .highlight-box {{
                            background: linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%);
                            border: 2px solid #bfdbfe;
                            border-radius: 16px;
                            padding: 24px;
                            margin: 24px 0;
                        }}
                        .highlight-box p {{
                            margin: 0;
                            color: #1e3a8a;
                            font-weight: 600;
                        }}
                        .warning-box {{
                            background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
                            border: 2px solid #fbbf24;
                            border-radius: 16px;
                            padding: 24px;
                            margin: 24px 0;
                        }}
                        .warning-box p {{
                            margin: 0;
                            color: #92400e;
                            font-weight: 600;
                        }}
                        .button {{ 
                            display: inline-block; 
                            padding: 16px 40px;
                            background: linear-gradient(135deg, #1e3a8a 0%, #312e81 50%, #1e40af 100%);
                            color: white !important;
                            text-decoration: none; 
                            border-radius: 12px;
                            margin: 24px 0;
                            font-weight: 700;
                            font-size: 16px;
                            box-shadow: 0 10px 25px -5px rgba(30, 58, 138, 0.4);
                            transition: all 0.3s ease;
                        }}
                        .button:hover {{
                            transform: translateY(-2px);
                            box-shadow: 0 15px 30px -5px rgba(30, 58, 138, 0.5);
                        }}
                        .link-box {{
                            background: #f8fafc;
                            border: 2px solid #e2e8f0;
                            border-radius: 12px;
                            padding: 16px;
                            margin: 16px 0;
                            word-break: break-all;
                        }}
                        .link-box a {{
                            color: #3b82f6;
                            text-decoration: none;
                            font-size: 14px;
                        }}
                        .footer {{ 
                            text-align: center; 
                            padding: 32px 40px;
                            background: #f8fafc;
                            border-top: 2px solid #e2e8f0;
                        }}
                        .footer p {{
                            color: #64748b;
                            font-size: 13px;
                            margin: 4px 0;
                        }}
                        .divider {{
                            height: 1px;
                            background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
                            margin: 24px 0;
                        }}
                        strong {{
                            color: #0f172a;
                            font-weight: 700;
                        }}
                    </style>
                </head>
                <body>
                    <div class='email-wrapper'>
                        <div class='header'>
                            <div class='icon-badge'>🔐</div>
                            <h1>Password Reset Request</h1>
                        </div>
                        <div class='content'>
                            <h2>Hello {userName}! 👋</h2>
                            <p>We received a request to reset the password for your auction account.</p>
                            
                            <div class='highlight-box'>
                                <p>🔑 Click the button below to reset your password:</p>
                            </div>

                            <div style='text-align: center;'>
                                <a href='{resetUrl}' class='button'>Reset Password</a>
                            </div>

                            <div class='divider'></div>

                            <p style='font-size: 14px; color: #64748b;'>Or copy and paste this link into your browser:</p>
                            <div class='link-box'>
                                <a href='{resetUrl}'>{resetUrl}</a>
                            </div>

                            <div class='warning-box'>
                                <p>⏰ This password reset link will expire in 1 hour.</p>
                            </div>

                            <div class='highlight-box' style='background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border-color: #fca5a5;'>
                                <p style='color: #991b1b;'>⚠️ If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
                            </div>

                            <p style='font-size: 14px; color: #64748b; margin-top: 24px;'>
                                For security reasons, never share this link with anyone.
                            </p>
                        </div>
                        <div class='footer'>
                            <p style='font-weight: 600; color: #475569;'>Online Auction System</p>
                            <p>&copy; 2025 All rights reserved.</p>
                            <p>Your trusted platform for online auctions</p>
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
