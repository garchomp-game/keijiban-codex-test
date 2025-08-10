import { Module, forwardRef } from '@nestjs/common';
import { RoomsModule } from '../rooms/rooms.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { RoomMemberGuard } from './guards/room-member.guard';
import { WsJwtAuthGuard } from './guards/ws-jwt-auth.guard';

@Module({
  imports: [forwardRef(() => RoomsModule)],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, RolesGuard, RoomMemberGuard, WsJwtAuthGuard],
  exports: [JwtAuthGuard, RolesGuard, RoomMemberGuard, WsJwtAuthGuard],
})
export class AuthModule {}
