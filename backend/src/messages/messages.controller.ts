import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagePostDto } from './dto/message-post.dto';
import { MessagePatchDto } from './dto/message-patch.dto';

@Controller()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('rooms/:roomId/messages')
  list(@Param('roomId') roomId: string) {
    return this.messagesService.listByRoom(roomId);
  }

  @Post('messages')
  async post(@Body() dto: MessagePostDto) {
    return this.messagesService.post('user-1', dto);
  }

  @Patch('messages/:messageId')
  async patch(@Param('messageId') id: string, @Body() dto: MessagePatchDto) {
    return this.messagesService.patch(id, dto);
  }

  @Delete('messages/:messageId')
  async remove(@Param('messageId') id: string) {
    return this.messagesService.delete(id);
  }
}
