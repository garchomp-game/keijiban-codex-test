import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient();
    const auth = client.handshake?.headers?.authorization as string | undefined;
    if (!auth || !auth.startsWith('Bearer ')) {
      throw new UnauthorizedException();
    }
    const token = auth.slice(7);
    if (token !== 'fake-access-token') {
      throw new UnauthorizedException();
    }
    (client as any).user = { userId: 'user-1', role: 'user' };
    return true;
  }
}
