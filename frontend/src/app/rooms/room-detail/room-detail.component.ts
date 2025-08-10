import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Room, RoomService } from '../room.service';
import { Message, MessageService } from '../../messages/message.service';

@Component({
  selector: 'app-room-detail',
  templateUrl: './room-detail.component.html',
  styleUrl: './room-detail.component.css'
})
export class RoomDetailComponent implements OnInit {
  room?: Room;
  messages: Message[] = [];
  newMessage = '';
  private roomId!: number;

  constructor(
    private route: ActivatedRoute,
    private roomService: RoomService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.roomId = Number(this.route.snapshot.paramMap.get('id'));
    this.room = this.roomService.getRoom(this.roomId);
    this.load();
  }

  load(): void {
    this.messages = this.messageService.getMessages(this.roomId);
  }

  addMessage(): void {
    if (!this.newMessage) return;
    this.messageService.addMessage(this.roomId, this.newMessage);
    this.newMessage = '';
    this.load();
  }

  updateMessage(msg: Message): void {
    this.messageService.updateMessage(this.roomId, msg);
    this.load();
  }

  deleteMessage(msg: Message): void {
    this.messageService.deleteMessage(this.roomId, msg.id);
    this.load();
  }
}
