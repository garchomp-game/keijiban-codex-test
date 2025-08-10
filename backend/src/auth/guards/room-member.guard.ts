import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { RoomsService } from '../../rooms/rooms.service';

@Injectable()
export class RoomMemberGuard implements CanActivate {
  constructor(private readonly roomsService: RoomsService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;
    const roomId = request.params?.roomId || request.body?.roomId;
    if (!userId || !roomId) {
      throw new ForbiddenException('Missing user or room');
    }
    const members = this.roomsService.listMembers(roomId);
    const isMember = members.some(m => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('Not a room member');
    }
    return true;
  }
}
