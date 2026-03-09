import { Component, input } from '@angular/core';
import { Chat } from '../../services/chat-service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-chat-message',
  imports: [
    DatePipe
  ],
  templateUrl: './chat-message.html',
  styleUrl: './chat-message.css',
})
export class ChatMessage {
  chatMessage = input.required<Chat>();
}
