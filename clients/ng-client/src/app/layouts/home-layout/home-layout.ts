import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Chat, ChatService } from '../../services/chat-service';
import { FormsModule } from '@angular/forms';
import { ChatMessage } from '../../components/chat-message/chat-message';
import { Subscription } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-home-layout',
  imports: [
    FormsModule,
    ChatMessage,
    AsyncPipe
  ],
  templateUrl: './home-layout.html',
  styleUrl: './home-layout.css',
})
export class HomeLayout implements OnInit, OnDestroy {
  protected chatService = inject(ChatService);

  protected room: string = '';
  protected message: string = '';
  protected username: string = '';
  protected isConnected = signal<boolean>(false);
  protected messages = signal<Chat[]>([]);

  private chatSub?: Subscription;

  ngOnInit(): void {
    this.chatService.start();
    this.receiveMessage();
  }

  private receiveMessage(): void {
    this.chatSub = this.chatService.chat$.subscribe((chat) => {
      const updatedChat: Chat = {
        ...chat,
        own: chat.username === this.username
      };
      this.messages.update((messages) => [...messages, updatedChat]);
    })
  }

  joinRoom(): void {
    if (!this.room) return;
    this.chatService.joinRoom(this.room)
      .then(() => this.isConnected.set(true));
  }

  leaveRoom(): void {
    if (!this.room) return;
    this.chatService.leaveRoom(this.room)
      .then(() => this.isConnected.set(false));
  }


  onSend(): void {
    if (!this.room || !this.message || !this.username) return;
    const chat: Chat = {
      message: this.message,
      username: this.username
    }
    this.chatService.sendMessage(this.room, chat);
    this.message = '';
  }

  autoResize(textarea: HTMLTextAreaElement) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  ngOnDestroy(): void {
    this.chatService.close();
    this.chatSub?.unsubscribe();
  }
}
