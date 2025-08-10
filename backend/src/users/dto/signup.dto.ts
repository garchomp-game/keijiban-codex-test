import { IsEmail, IsString } from 'class-validator';

export class SignupDto {
  @IsEmail()
  email: string;

  @IsString()
  displayName: string;
}
