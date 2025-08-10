import { Body, Controller, Post } from '@nestjs/common';
import { InvitesService } from './invites.service';
import { CreateInviteDto } from './dto/create-invite.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';

@Controller('invites')
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  @Post()
  create(@Body() dto: CreateInviteDto) {
    return this.invitesService.create(dto);
  }

  @Post('accept')
  accept(@Body() dto: AcceptInviteDto) {
    this.invitesService.accept(dto);
  }
}
