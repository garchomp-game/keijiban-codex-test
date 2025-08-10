import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
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

@Injectable()
export class AuthService {
  private prisma = new PrismaClient();
  private readonly refreshSecret = 'refresh-secret';

  constructor(private readonly jwtService: JwtService) {}

  async signup(dto: SignupDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email already exists');
    }
    const user = await this.prisma.user.create({
      data: { email: dto.email, name: dto.displayName, password: dto.password },
    });
    const tokens = await this.issueTokens(user.id);
    return { userId: user.id, email: user.email, displayName: user.name, ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || user.password !== dto.password) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.issueTokens(user.id);
  }

  private async issueTokens(userId: number) {
    const accessToken = await this.jwtService.signAsync({ sub: userId });
    const jti = randomUUID();
    const refreshToken = await this.jwtService.signAsync(
      { sub: userId, jti },
      { secret: this.refreshSecret, expiresIn: '7d' },
    );
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    return { accessToken, refreshToken };
  }

  async validateAccessToken(token: string) {
    try {
      return await this.jwtService.verifyAsync(token);
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async rotateRefreshToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, { secret: this.refreshSecret });
      const stored = await this.prisma.refreshToken.findUnique({ where: { token } });
      if (!stored) {
        throw new UnauthorizedException('Invalid token');
      }
      if (stored.expiresAt < new Date()) {
        await this.prisma.refreshToken.delete({ where: { id: stored.id } });
        throw new UnauthorizedException('Refresh token expired');
      }
      await this.prisma.refreshToken.delete({ where: { id: stored.id } });
      return this.issueTokens(payload.sub);
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
