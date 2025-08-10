import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { CreateRoomDto, RoomVisibility } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { AddMemberDto } from './dto/add-member.dto';

export interface Room {
  roomId: string;
  name: string;
  description?: string;
  visibility: RoomVisibility;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoomMember {
  roomId: string;
  userId: string;
  roleInRoom: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

@Injectable()
export class RoomsService {
  private rooms: Room[] = [];
  private members: RoomMember[] = [];

  list(visibility?: RoomVisibility): Room[] {
    return this.rooms.filter(r => !visibility || r.visibility === visibility);
  }

  create(dto: CreateRoomDto): Room {
    const now = new Date().toISOString();
    const room: Room = {
      roomId: uuid(),
      name: dto.name,
      description: dto.description,
      visibility: dto.visibility,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };
    this.rooms.push(room);
    return room;
  }

  get(roomId: string): Room {
    const room = this.rooms.find(r => r.roomId === roomId);
    if (!room) throw new NotFoundException();
    return room;
  }

  update(roomId: string, dto: UpdateRoomDto): Room {
    const room = this.get(roomId);
    Object.assign(room, dto);
    room.updatedAt = new Date().toISOString();
    return room;
  }

  delete(roomId: string) {
    this.rooms = this.rooms.filter(r => r.roomId !== roomId);
    this.members = this.members.filter(m => m.roomId !== roomId);
  }

  addMember(roomId: string, dto: AddMemberDto) {
    const member: RoomMember = {
      roomId,
      userId: dto.userId,
      roleInRoom: 'member',
      joinedAt: new Date().toISOString(),
    };
    this.members.push(member);
  }

  listMembers(roomId: string): RoomMember[] {
    return this.members.filter(m => m.roomId === roomId);
  }

  removeMember(roomId: string, userId: string) {
    this.members = this.members.filter(m => m.roomId !== roomId || m.userId !== userId);
  }
}
