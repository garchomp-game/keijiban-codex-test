import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.usersService.create(dto.email, dto.displayName);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    const user = this.usersService.findByEmail(dto.email);
    if (user) return user;
    return this.usersService.create(dto.email, dto.email);
  }
}
