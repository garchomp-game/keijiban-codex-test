import { IsString, IsUUID, MaxLength, IsOptional } from 'class-validator';

export class MessagePostDto {
  @IsUUID()
  roomId: string;

  @IsString()
  @MaxLength(4000)
  body: string;

  @IsOptional()
  @IsString()
  clientMsgId?: string;
}
