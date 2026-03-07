import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Chat, ChatService } from '../../services/chat-service';
import { FormsModule } from '@angular/forms';
import { ChatMessage } from '../../components/chat-message/chat-message';
import { Subscription } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { EncryptService, Payload } from '../../services/encrypt-service';

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
  private encryptService = inject(EncryptService);

  protected room: string = '';
  protected message: string = '';
  protected username: string = '';
  protected isConnected = signal<boolean>(false);
  protected messages = signal<Chat[]>([]);

  private chatSub?: Subscription;

  ngOnInit(): void {
    this.chatService.start();
    this.receiveMessage();
    this.getDataFromSessionStorage();
  }

  private receiveMessage(): void {
    this.chatSub = this.chatService.chat$.subscribe((chat) => {
      const updatedChat: Chat = {
        ...chat,
        own: chat.username === this.username
      };
      this.messages.update((messages) => [...messages, updatedChat]);
      sessionStorage.setItem('messages', JSON.stringify(this.messages()));
    })
  }

  joinRoom(): void {
    if (!this.room) return;
    this.chatService.joinRoom(this.room)
      .then(() => {
        this.isConnected.set(true);
        const userSessionStorage = {
          username: this.username,
          room: this.room,
          secret: this.chatService.secret()
        };
        sessionStorage.setItem('userData', JSON.stringify(userSessionStorage));
        const messagesSessionStorage = sessionStorage.getItem('messages');
        if (messagesSessionStorage) this.messages.set(JSON.parse(messagesSessionStorage));
      });
  }

  leaveRoom(): void {
    if (!this.room) return;
    this.chatService.leaveRoom(this.room)
      .then(() => this.isConnected.set(false));
  }


  async onSend(): Promise<void> {
    if (!this.room || !this.message || !this.username) return;
    const payload: Payload = await this.encryptService.encrypt(this.message, this.chatService.secret());
    const chat: Chat = {
      payload: payload,
      username: this.username
    }
    this.chatService.sendMessage(this.room, chat);
    this.message = '';
  }

  private getDataFromSessionStorage(): void {
    const userSessionStorage = sessionStorage.getItem('userData');
    if (!userSessionStorage) return;
    const userData = JSON.parse(userSessionStorage);
    this.room = userData.room;
    this.username = userData.username;
    this.chatService.secret.set(userData.secret);
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
