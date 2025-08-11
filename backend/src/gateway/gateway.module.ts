import { Module } from '@nestjs/common';
import { GatewayGateway } from './gateway.gateway';
import { MessagesModule } from '../messages/messages.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [MessagesModule, AuthModule],
  providers: [GatewayGateway],
})
export class GatewayModule {}
