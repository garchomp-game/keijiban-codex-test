import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto, RoomVisibility } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  list(@Query('visibility') visibility?: RoomVisibility) {
    return this.roomsService.list(visibility);
  }

  @Post()
  create(@Body() dto: CreateRoomDto) {
    return this.roomsService.create(dto);
  }

  @Get(':roomId')
  get(@Param('roomId') roomId: string) {
    return this.roomsService.get(roomId);
  }

  @Patch(':roomId')
  update(@Param('roomId') roomId: string, @Body() dto: UpdateRoomDto) {
    return this.roomsService.update(roomId, dto);
  }

  @Delete(':roomId')
  remove(@Param('roomId') roomId: string) {
    this.roomsService.delete(roomId);
  }

  @Post(':roomId/members')
  addMember(@Param('roomId') roomId: string, @Body() dto: AddMemberDto) {
    this.roomsService.addMember(roomId, dto);
  }

  @Get(':roomId/members')
  listMembers(@Param('roomId') roomId: string) {
    return this.roomsService.listMembers(roomId);
  }

  @Delete(':roomId/members/:userId')
  removeMember(@Param('roomId') roomId: string, @Param('userId') userId: string) {
    this.roomsService.removeMember(roomId, userId);
  }
}
