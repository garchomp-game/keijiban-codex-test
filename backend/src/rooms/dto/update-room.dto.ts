import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { RoomVisibility } from './create-room.dto';

export class UpdateRoomDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(RoomVisibility)
  visibility?: RoomVisibility;

  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;
}
