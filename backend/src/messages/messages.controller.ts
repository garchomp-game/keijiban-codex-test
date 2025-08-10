import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagePostDto } from './dto/message-post.dto';
import { MessagePatchDto } from './dto/message-patch.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('rooms/:roomId/messages')
  list(@Param('roomId') roomId: string) {
    return this.messagesService.listByRoom(roomId);
  }

  @Post('messages')
  post(@Body() dto: MessagePostDto) {
    return this.messagesService.post('user-1', dto);
  }

  @Patch('messages/:messageId')
  patch(@Param('messageId') id: string, @Body() dto: MessagePatchDto) {
    return this.messagesService.patch(id, dto);
  }

  @Delete('messages/:messageId')
  remove(@Param('messageId') id: string) {
    this.messagesService.delete(id);
  }
}
