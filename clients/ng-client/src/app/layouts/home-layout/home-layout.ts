import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat-service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home-layout',
  imports: [
    FormsModule
  ],
  templateUrl: './home-layout.html',
  styleUrl: './home-layout.css',
})
export class HomeLayout implements OnInit, OnDestroy {
  private chatService = inject(ChatService);

  protected room: string = '';
  protected message: string = '';

  ngOnInit(): void {
    this.chatService.start();
  }

  joinRoom(): void {
    if (!this.room) return;
    this.chatService.joinRoom(this.room);
  }


  onSend(): void {
    if (!this.room || !this.message) return;
    this.chatService.sendMessage(this.room, this.message);
  }

  ngOnDestroy(): void {
    this.chatService.close();
  }
}
