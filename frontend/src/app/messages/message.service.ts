import { Injectable } from '@angular/core';

export interface Message {
  id: number;
  content: string;
}

@Injectable({ providedIn: 'root' })
export class MessageService {
  private store: { [roomId: number]: Message[] } = {};
  private idCounter = 1;

  getMessages(roomId: number): Message[] {
    return this.store[roomId] ?? [];
  }

  addMessage(roomId: number, content: string): void {
    const list = this.getMessages(roomId);
    list.push({ id: this.idCounter++, content });
    this.store[roomId] = list;
  }

  updateMessage(roomId: number, message: Message): void {
    const list = this.getMessages(roomId);
    const idx = list.findIndex(m => m.id === message.id);
    if (idx >= 0) {
      list[idx] = { ...message };
      this.store[roomId] = list;
    }
  }

  deleteMessage(roomId: number, id: number): void {
    const list = this.getMessages(roomId);
    this.store[roomId] = list.filter(m => m.id !== id);
  }
}
