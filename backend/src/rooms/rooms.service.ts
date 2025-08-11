import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateRoomDto, RoomVisibility } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { AddMemberDto } from './dto/add-member.dto';

export interface RoomMember {
  roomId: string;
  userId: string;
  roleInRoom: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  list(visibility?: RoomVisibility) {
    return this.prisma.room.findMany({
      where: visibility ? { visibility } : undefined,
    });
  }

  create(dto: CreateRoomDto) {
    return this.prisma.room.create({ data: dto });
  }

  async get(roomId: string) {
    const room = await this.prisma.room.findUnique({ where: { id: roomId } });
    if (!room) throw new NotFoundException();
    return room;
  }

  update(roomId: string, dto: UpdateRoomDto) {
    return this.prisma.room.update({
      where: { id: roomId },
      data: { ...dto },
    });
  }

  async delete(roomId: string) {
    await this.prisma.message.deleteMany({ where: { roomId } });
    await this.prisma.room.delete({ where: { id: roomId } });
  }

  async addMember(roomId: string, dto: AddMemberDto) {
    const room = await this.get(roomId);
    const members: RoomMember[] = (room.members as any) || [];
    members.push({
      roomId,
      userId: dto.userId,
      roleInRoom: 'member',
      joinedAt: new Date().toISOString(),
    });
    await this.prisma.room.update({
      where: { id: roomId },
      data: { members: members as unknown as Prisma.JsonArray },
    });
  }

  async listMembers(roomId: string): Promise<RoomMember[]> {
    const room = await this.get(roomId);
    return (room.members as any) || [];
  }

  async removeMember(roomId: string, userId: string) {
    const room = await this.get(roomId);
    const members: RoomMember[] = (room.members as any) || [];
    await this.prisma.room.update({
      where: { id: roomId },
      data: { members: members.filter(m => m.userId !== userId) as unknown as Prisma.JsonArray },
    });
  }
}
