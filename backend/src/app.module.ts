import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { RoomsModule } from './rooms/rooms.module';
import { MessagesModule } from './messages/messages.module';
import { InvitesModule } from './invites/invites.module';
import { GatewayModule } from './gateway/gateway.module';

@Module({
  imports: [UsersModule, RoomsModule, MessagesModule, InvitesModule, GatewayModule],
})
export class AppModule {}
