using System;

namespace API.Application.DTOs;

public class ChatDto
{
    public string Username { get; set; } = string.Empty;
    public PayloadDto? Payload { get; set; }
    public DateTime SendAt { get; set; }
}

public class PayloadDto
{
    public int V { get; set; }
    public string I { get; set; } = string.Empty;
    public string S { get; set; } = string.Empty;
    public string D { get; set; } = string.Empty;

}