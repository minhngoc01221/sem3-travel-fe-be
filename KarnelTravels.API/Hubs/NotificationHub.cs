using Microsoft.AspNetCore.SignalR;
using KarnelTravels.API.DTOs;

namespace KarnelTravels.API.Hubs;

public interface INotificationClient
{
    Task ReceiveBookingNotification(BookingNotificationDto notification);
    Task ReceiveContactNotification(UnreadContactDto contact);
}

public class NotificationHub : Hub<INotificationClient>
{
    public async Task JoinAdminGroup()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "AdminGroup");
    }

    public async Task LeaveAdminGroup()
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, "AdminGroup");
    }

    public override async Task OnConnectedAsync()
    {
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await base.OnDisconnectedAsync(exception);
    }
}

// Service to send notifications from controllers
public interface INotificationService
{
    Task SendBookingNotification(BookingNotificationDto notification);
    Task SendContactNotification(UnreadContactDto contact);
}

public class NotificationService : INotificationService
{
    private readonly IHubContext<NotificationHub, INotificationClient> _hubContext;

    public NotificationService(IHubContext<NotificationHub, INotificationClient> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task SendBookingNotification(BookingNotificationDto notification)
    {
        await _hubContext.Clients.Group("AdminGroup").ReceiveBookingNotification(notification);
    }

    public async Task SendContactNotification(UnreadContactDto contact)
    {
        await _hubContext.Clients.Group("AdminGroup").ReceiveContactNotification(contact);
    }
}
