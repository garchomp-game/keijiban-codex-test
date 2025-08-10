import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from '../messages/messages.service';

@WebSocketGateway({ namespace: '/ws' })
export class GatewayGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly messagesService: MessagesService) {}

  @SubscribeMessage('room:join')
  handleJoin(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string }) {
    client.join(data.roomId);
    return { ok: true };
  }

  @SubscribeMessage('room:left')
  handleLeft(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string }) {
    client.leave(data.roomId);
    return { ok: true };
  }

  @SubscribeMessage('message:send')
  handleSend(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string; body: string; clientMsgId?: string }) {
    const msg = this.messagesService.post('user-1', { roomId: data.roomId, body: data.body });
    this.server.to(data.roomId).emit('message:delivered', { message: msg });
    return { ok: true, message: msg };
  }

  @SubscribeMessage('message:edit')
  handleEdit(@MessageBody() data: { messageId: string; body: string }) {
    const msg = this.messagesService.patch(data.messageId, { body: data.body });
    this.server.emit('message:edited', { message: msg });
    return { ok: true, message: msg };
  }

  @SubscribeMessage('message:delete')
  handleDelete(@MessageBody() data: { messageId: string }) {
    this.messagesService.delete(data.messageId);
    this.server.emit('message:deleted', { messageId: data.messageId });
    return { ok: true };
  }
}
