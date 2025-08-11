import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'crypto';

export interface SignupDto {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

interface User {
  userId: string;
  email: string;
  password: string;
  displayName: string;
}

@Injectable()
export class AuthService {
  private users: User[] = [];
  private refreshTokens: Map<string, string> = new Map();

  signup(dto: SignupDto) {
    if (this.users.find(u => u.email === dto.email)) {
      throw new ConflictException('Email already exists');
    }
    const user: User = {
      userId: randomUUID(),
      email: dto.email,
      password: dto.password,
      displayName: dto.displayName,
    };
    this.users.push(user);
    const { password, ...result } = user;
    return result;
  }

  login(dto: LoginDto) {
    const user = this.users.find(
      u => u.email === dto.email && u.password === dto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const tokens = this.generateTokens(user.userId);
    return tokens;
  }

  refresh(refreshToken: string) {
    const userId = this.refreshTokens.get(refreshToken);
    if (!userId) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    this.invalidateRefreshToken(refreshToken);
    return this.generateTokens(userId);
  }

  logout(refreshToken: string) {
    this.invalidateRefreshToken(refreshToken);
  }

  private generateTokens(userId: string) {
    const refreshToken = randomUUID();
    const accessToken = randomUUID();
    this.refreshTokens.set(refreshToken, userId);
    return { accessToken, refreshToken };
  }

  private invalidateRefreshToken(refreshToken: string) {
    this.refreshTokens.delete(refreshToken);
  }
}
