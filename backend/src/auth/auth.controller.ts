import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AuthService, SignupDto, LoginDto } from './auth.service';

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
  refresh(@Body('refreshToken') token: string) {
    return this.authService.rotateRefreshToken(token);
  }

  @Post('validate')
  @HttpCode(200)
  validate(@Body('accessToken') token: string) {
    return this.authService.validateAccessToken(token);
  }
}
