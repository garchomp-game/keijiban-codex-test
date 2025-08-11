import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MessagePostDto } from './dto/message-post.dto';
import { MessagePatchDto } from './dto/message-patch.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  post(userId: string, dto: MessagePostDto) {
    return this.prisma.message.create({
      data: {
        roomId: dto.roomId,
        userId,
        body: dto.body,
      },
    });
  }

  async patch(messageId: string, dto: MessagePatchDto) {
    try {
      return await this.prisma.message.update({
        where: { id: messageId },
        data: { body: dto.body, editedAt: new Date() },
      });
    } catch {
      throw new NotFoundException();
    }
  }

  async delete(messageId: string) {
    try {
      await this.prisma.message.update({
        where: { id: messageId },
        data: { status: 'deleted' },
      });
    } catch {
      throw new NotFoundException();
    }
  }

  listByRoom(roomId: string) {
    return this.prisma.message.findMany({
      where: { roomId, status: 'active' },
      orderBy: { createdAt: 'asc' },
      include: {
        user: { select: { displayName: true } },
      },
    });
  }
}
