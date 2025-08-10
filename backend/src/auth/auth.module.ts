import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { RoomsModule } from '../rooms/rooms.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { RoomMemberGuard } from './guards/room-member.guard';
import { WsJwtAuthGuard } from './guards/ws-jwt-auth.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: 'access-secret',
      signOptions: { expiresIn: '15m' },
    }),
    forwardRef(() => RoomsModule),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, RolesGuard, RoomMemberGuard, WsJwtAuthGuard],
  exports: [AuthService, JwtAuthGuard, RolesGuard, RoomMemberGuard, WsJwtAuthGuard],
})
export class AuthModule {}
