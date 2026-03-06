import { Injectable } from '@angular/core';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { BehaviorSubject, Subject } from 'rxjs';

export interface Chat {
  username: string;
  message: string;
  own?: boolean;
  sendAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private _hubConnection = new HubConnectionBuilder()
    .withAutomaticReconnect()
    .withUrl('https://localhost:5001/chatHub')
    .build();

  private _chat = new Subject<Chat>();
  private _onlineUsers = new BehaviorSubject<number>(0);
  chat$ = this._chat.asObservable();
  onlineUsers$ = this._onlineUsers.asObservable();


  start(): void {
    this._hubConnection.start()
      .then(() => console.log('Connection started'))
      .catch((err) => console.log('Error: ' + err));

    this._hubConnection.on('ReceiveMessage', (chat) => this._chat.next(chat));

    this._hubConnection.on("RoomCount", (count) => this._onlineUsers.next(count));
  }

  joinRoom(roomName: string): Promise<any> {
    return this._hubConnection.invoke('JoinRoom', roomName)
  }

  leaveRoom(roomName: string): Promise<any> {
    return this._hubConnection.invoke('LeaveRoom', roomName);
  }

  sendMessage(roomName: string, chat: Chat): void {
    this._hubConnection.invoke('SendMessage', roomName, chat);
  }

  close(): void {
    this._hubConnection.stop()
      .then(() => console.log('Connection closed'))
      .catch((err) => console.log("Error: " + err));
  }

}
