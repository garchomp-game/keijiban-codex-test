import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { CreateInviteDto } from './dto/create-invite.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';

export interface InviteToken {
  token: string;
  roomId: string;
  expiresAt: Date;
}

@Injectable()
export class InvitesService {
  private invites: InviteToken[] = [];

  create(dto: CreateInviteDto): InviteToken {
    const token: InviteToken = {
      token: uuid(),
      roomId: dto.roomId,
      expiresAt: new Date(Date.now() + (dto.expiresInHours ?? 24) * 3600 * 1000),
    };
    this.invites.push(token);
    return token;
  }

  accept(dto: AcceptInviteDto) {
    const invite = this.invites.find(i => i.token === dto.token);
    if (!invite) throw new NotFoundException();
    // remove after accept
    this.invites = this.invites.filter(i => i.token !== dto.token);
  }
}
