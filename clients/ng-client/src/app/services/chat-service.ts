import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private _hubConnection = new HubConnectionBuilder()
    .withAutomaticReconnect()
    .withUrl('https://localhost:5001/chatHub')
    .build();

  private _message = new Subject<string>();


  start(): void {
    this._hubConnection.start()
      .then(() => console.log('Connection started'))
      .catch((err) => console.log('Error: ' + err));

      this._hubConnection.on('ReceiveMessage', (message) => {
        console.log(message);
      })
  }

  joinRoom(roomName: string): void {
    this._hubConnection.invoke('JoinRoom', roomName)
    .then(() => console.log('Successfully joined to room'))
    .catch((err) => console.log('Err: ' + err));
  }

  leaveRoom(roomName: string): void {
    this._hubConnection.invoke('LeaveRoom', roomName);
  }

  sendMessage(roomName: string, message: string): void {
    this._hubConnection.invoke('SendMessage', roomName, message);
  }

  close(): void {
    this._hubConnection.stop()
      .then(() => console.log('Connection closed'))
      .catch((err) => console.log("Error: " + err));
  }

}
