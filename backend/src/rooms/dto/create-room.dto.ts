import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum RoomVisibility {
  public = 'public',
  private = 'private',
}

export class CreateRoomDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(RoomVisibility)
  visibility: RoomVisibility;
}
