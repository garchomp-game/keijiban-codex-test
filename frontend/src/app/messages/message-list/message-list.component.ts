import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Message } from '../message.service';

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.component.html',
  styleUrl: './message-list.component.css'
})
export class MessageListComponent {
  @Input() messages: Message[] = [];
  @Output() update = new EventEmitter<Message>();
  @Output() remove = new EventEmitter<Message>();

  editing: Message | null = null;
  editContent = '';

  startEdit(msg: Message): void {
    this.editing = msg;
    this.editContent = msg.content;
  }

  save(msg: Message): void {
    if (!this.editing) return;
    msg.content = this.editContent;
    this.update.emit(msg);
    this.editing = null;
  }

  delete(msg: Message): void {
    this.remove.emit(msg);
  }
}
