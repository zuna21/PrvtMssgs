using System;
using System.Collections.Concurrent;
using API.Application.DTOs;
using Microsoft.AspNetCore.SignalR;

namespace API.Hubs;

public class ChatHub : Hub
{
    private static readonly ConcurrentDictionary<string, ConcurrentDictionary<string, byte>> Rooms
    = new();

    private static readonly ConcurrentDictionary<string, ConcurrentDictionary<string, byte>> Connections
    = new();
    private static readonly ConcurrentDictionary<string, byte> OnlineConnections = new();

    public async Task JoinRoom(string roomName)
    {
        var connectionId = Context.ConnectionId;
        await Groups.AddToGroupAsync(connectionId, roomName);

        var room = Rooms.GetOrAdd(roomName, _ => new ConcurrentDictionary<string, byte>());
        room.TryAdd(connectionId, 0);

        var connectionGroups = Connections.GetOrAdd(connectionId, _ => new ConcurrentDictionary<string, byte>());
        connectionGroups.TryAdd(roomName, 0);

        await Clients.Group(roomName).SendAsync("RoomCount", room.Count);
    }
    public async Task LeaveRoom(string roomName)
    {
        var connectionId = Context.ConnectionId;
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomName);

        if (Rooms.TryGetValue(roomName, out var room))
        {
            room.TryRemove(connectionId, out _);
            if (room.IsEmpty) Rooms.TryRemove(roomName, out _);
            
            await Clients.Group(roomName).SendAsync("RoomCount", room.Count);
        }

        if (Connections.TryGetValue(connectionId, out var connectionGroup))
        {
            connectionGroup.TryRemove(roomName, out _);

            if (connectionGroup.IsEmpty) Connections.TryRemove(connectionId, out _);
        }

    }
    public async Task SendMessage(string roomName, ChatDto chat)
    {
        chat.SendAt = DateTime.UtcNow;
        await Clients.Group(roomName).SendAsync("ReceiveMessage", chat);
    }

    public override async Task OnConnectedAsync()
    {
        var connectionId = Context.ConnectionId;
        OnlineConnections.TryAdd(connectionId, 0);
        await Clients.All.SendAsync("OnlineCount", OnlineConnections.Count);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var connectionId = Context.ConnectionId;

        OnlineConnections.TryRemove(connectionId, out _);
        await Clients.All.SendAsync("OnlineCount", OnlineConnections.Count);

        if (Connections.TryRemove(connectionId, out var groups))
        {
            foreach (var groupName in groups.Keys)
            {
                if (Rooms.TryGetValue(groupName, out var group))
                {
                    group.TryRemove(connectionId, out _);

                    await Clients.Group(groupName).SendAsync("RoomCount", group.Count);

                    if (group.IsEmpty) Rooms.TryRemove(groupName, out _);
                }
            }
        }

        await base.OnDisconnectedAsync(exception);
    }
}
