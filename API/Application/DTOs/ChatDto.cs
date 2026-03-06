using System;

namespace API.Application.DTOs;

public class ChatDto
{
    public string Username { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public DateTime SendAt { get; set; }
}
