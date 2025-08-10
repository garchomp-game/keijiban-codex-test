import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { MessagePostDto } from './dto/message-post.dto';
import { MessagePatchDto } from './dto/message-patch.dto';

export interface Message {
  messageId: string;
  roomId: string;
  userId: string;
  body: string;
  status: 'active' | 'deleted';
  createdAt: string;
  editedAt?: string | null;
}

@Injectable()
export class MessagesService {
  private messages: Message[] = [];

  post(userId: string, dto: MessagePostDto): Message {
    const msg: Message = {
      messageId: uuid(),
      roomId: dto.roomId,
      userId,
      body: dto.body,
      status: 'active',
      createdAt: new Date().toISOString(),
      editedAt: null,
    };
    this.messages.push(msg);
    return msg;
  }

  patch(messageId: string, dto: MessagePatchDto): Message {
    const msg = this.messages.find(m => m.messageId === messageId);
    if (!msg) throw new NotFoundException();
    if (dto.body !== undefined) {
      msg.body = dto.body;
      msg.editedAt = new Date().toISOString();
    }
    return msg;
  }

  delete(messageId: string) {
    const msg = this.messages.find(m => m.messageId === messageId);
    if (!msg) throw new NotFoundException();
    msg.status = 'deleted';
  }

  listByRoom(roomId: string): Message[] {
    return this.messages.filter(m => m.roomId === roomId);
  }
}
