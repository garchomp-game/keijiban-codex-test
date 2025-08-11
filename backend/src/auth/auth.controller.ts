import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { IsJWT } from 'class-validator';
import { AuthService, SignupDto, LoginDto } from './auth.service';

class RefreshDto {
  @IsJWT()
  refreshToken!: string;
}

class ValidateDto {
  @IsJWT()
  accessToken!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(200)
  refresh(@Body() dto: RefreshDto) {
    return this.authService.rotateRefreshToken(dto.refreshToken);
  }

  @Post('validate')
  @HttpCode(200)
  validate(@Body() dto: ValidateDto) {
    return this.authService.validateAccessToken(dto.accessToken);
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Body('refreshToken') refreshToken: string) {
    this.authService.logout(refreshToken);
    return { success: true };
  }
}
