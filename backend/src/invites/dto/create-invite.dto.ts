import { IsOptional, IsUUID, IsInt } from 'class-validator';

export class CreateInviteDto {
  @IsUUID()
  roomId: string;

  @IsOptional()
  @IsInt()
  expiresInHours?: number = 24;
}
