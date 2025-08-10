import { IsOptional, IsString, MaxLength } from 'class-validator';

export class MessagePatchDto {
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  body?: string;
}
