using System.Net;
using System.Net.Mail;
using System.Text;

namespace KarnelTravels.API.Services;

public interface IEmailService
{
    Task<bool> SendEmailAsync(string toEmail, string subject, string body);
    Task<bool> SendBookingConfirmationAsync(string toEmail, string customerName, string bookingCode, 
        string serviceName, DateTime checkIn, DateTime checkOut, decimal totalAmount);
    Task<bool> SendReplyEmailAsync(string toEmail, string customerName, string subject, string replyMessage, string originalMessage);
}

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<bool> SendEmailAsync(string toEmail, string subject, string body)
    {
        try
        {
            var smtpHost = _configuration["Email:SmtpHost"] ?? "smtp.gmail.com";
            var smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
            var smtpUser = _configuration["Email:Username"] ?? "";
            var smtpPass = _configuration["Email:Password"] ?? "";
            var fromEmail = _configuration["Email:FromEmail"] ?? "noreply@karneltravels.com";
            var fromName = _configuration["Email:FromName"] ?? "Karnel Travels";

            using var client = new SmtpClient(smtpHost, smtpPort)
            {
                EnableSsl = true,
                Credentials = new NetworkCredential(smtpUser, smtpPass),
                Timeout = 30000
            };

            var message = new MailMessage
            {
                From = new MailAddress(fromEmail, fromName),
                Subject = subject,
                Body = body,
                IsBodyHtml = true,
                BodyEncoding = Encoding.UTF8,
                SubjectEncoding = Encoding.UTF8
            };

            message.To.Add(toEmail);

            await client.SendMailAsync(message);
            _logger.LogInformation("Email sent successfully to {Email}", toEmail);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
            return false;
        }
    }

    public async Task<bool> SendBookingConfirmationAsync(
        string toEmail, 
        string customerName, 
        string bookingCode, 
        string serviceName, 
        DateTime checkIn, 
        DateTime checkOut, 
        decimal totalAmount)
    {
        var subject = $"Xác nhận đặt phòng - {bookingCode} - Karnel Travels";
        
        var body = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        .info-table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
        .info-table td {{ padding: 12px; border-bottom: 1px solid #ddd; }}
        .info-table td:first-child {{ font-weight: bold; width: 40%; color: #555; }}
        .total {{ font-size: 24px; font-weight: bold; color: #667eea; }}
        .footer {{ text-align: center; margin-top: 20px; color: #888; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🎉 Xác nhận đặt phòng</h1>
            <p>Karnel Travels</p>
        </div>
        <div class='content'>
            <p>Xin chào <strong>{customerName}</strong>,</p>
            <p>Cảm ơn bạn đã đặt phòng tại Karnel Travels! Dưới đây là thông tin chi tiết:</p>
            
            <table class='info-table'>
                <tr>
                    <td>Mã đặt phòng:</td>
                    <td><strong>{bookingCode}</strong></td>
                </tr>
                <tr>
                    <td>Dịch vụ:</td>
                    <td>{serviceName}</td>
                </tr>
                <tr>
                    <td>Ngày nhận phòng:</td>
                    <td>{checkIn:dd/MM/yyyy}</td>
                </tr>
                <tr>
                    <td>Ngày trả phòng:</td>
                    <td>{checkOut:dd/MM/yyyy}</td>
                </tr>
                <tr>
                    <td>Tổng tiền:</td>
                    <td class='total'>{totalAmount.ToString("N0")} VND</td>
                </tr>
            </table>
            
            <p><strong>Lưu ý:</strong></p>
            <ul>
                <li>Vui lòng đến trước giờ nhận phòng 30 phút.</li>
                <li>Mang theo CMND/CCCD hoặc hộ chiếu để làm thủ tục.</li>
                <li>Nếu cần hỗ trợ, liên hệ hotline: 1900 xxxx</li>
            </ul>
            
            <p>Chúc bạn có một kỳ nghỉ tuyệt vời!</p>
        </div>
        <div class='footer'>
            <p>© 2026 Karnel Travels. All rights reserved.</p>
            <p>Email: support@karneltravels.com | Hotline: 1900 xxxx</p>
        </div>
    </div>
</body>
</html>";

        return await SendEmailAsync(toEmail, subject, body);
    }

    public async Task<bool> SendReplyEmailAsync(
        string toEmail, 
        string customerName, 
        string subject, 
        string replyMessage,
        string originalMessage)
    {
        var emailSubject = $"Re: {subject}";
        
        var body = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 25px; border-radius: 0 0 10px 10px; }}
        .original-message {{ background: #e5e7eb; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; }}
        .reply-message {{ background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; }}
        .footer {{ text-align: center; margin-top: 20px; color: #888; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2>📩 Phản hồi từ Karnel Travels</h2>
        </div>
        <div class='content'>
            <p>Xin chào <strong>{customerName}</strong>,</p>
            
            <p>Cảm ơn bạn đã liên hệ với chúng tôi. Dưới đây là phản hồi của chúng tôi:</p>
            
            <div class='original-message'>
                <strong>Tin nhắn gốc:</strong><br/>
                {originalMessage}
            </div>
            
            <div class='reply-message'>
                <strong>Phản hồi:</strong><br/>
                {replyMessage}
            </div>
            
            <p style='margin-top: 20px;'>Nếu bạn cần thêm thông tin, vui lòng liên hệ lại hoặc gọi hotline: <strong>1900 xxxx</strong></p>
            
            <p>Trân trọng,<br/>Đội ngũ Karnel Travels</p>
        </div>
        <div class='footer'>
            <p>© 2026 Karnel Travels. All rights reserved.</p>
            <p>Email: support@karneltravels.com | Hotline: 1900 xxxx</p>
        </div>
    </div>
</body>
</html>";

        return await SendEmailAsync(toEmail, emailSubject, body);
    }
}
