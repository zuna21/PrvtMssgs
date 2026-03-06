using System;
using Microsoft.AspNetCore.SignalR;

namespace API.Hubs;

public class ChatHub : Hub
{

    public Task JoinRoom(string roomName)
    {
        return Groups.AddToGroupAsync(Context.ConnectionId, roomName);
    }
    public Task LeaveRoom(string roomName)
    {
        return Groups.RemoveFromGroupAsync(Context.ConnectionId, roomName);
    }
    public async Task SendMessage(string roomName, string message)
    {
        await Clients.Group(roomName).SendAsync("ReceiveMessage", message);
    }
}
