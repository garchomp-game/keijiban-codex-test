import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

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
  private readonly refreshSecret: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.refreshSecret = this.config.get<string>('JWT_REFRESH_SECRET') || 'refresh-secret';
  }

  async signup(dto: SignupDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email already exists');
    }
    const passwordHash = await bcrypt.hash(dto.password, 12);
    let user;
    try {
      user = await this.prisma.user.create({
        data: { email: dto.email, name: dto.displayName, passwordHash },
      });
    } catch (e: any) {
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Email already exists');
      }
      throw e;
    }
    const tokens = await this.issueTokens(user.id);
    return { userId: user.id, email: user.email, displayName: user.name, ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const ok = await bcrypt.compare(dto.password, user.passwordHash ?? '');
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.issueTokens(user.id);
  }

  private async issueTokens(userId: number) {
    const accessToken = await this.jwtService.signAsync(
      { sub: userId },
      { expiresIn: '15m', issuer: 'auth', audience: 'api' },
    );
    const jti = randomUUID();
    const refreshToken = await this.jwtService.signAsync(
      { sub: userId, jti },
      { secret: this.refreshSecret, expiresIn: '7d', issuer: 'auth', audience: 'api' },
    );
    await this.prisma.refreshToken.create({
      data: {
        jti,
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
      const stored = await this.prisma.refreshToken.findUnique({ where: { jti: payload.jti } });
      if (!stored) {
        throw new UnauthorizedException('Invalid token');
      }
      if (stored.userId !== payload.sub) {
        throw new UnauthorizedException('Invalid token');
      }
      if (stored.expiresAt < new Date()) {
        await this.prisma.refreshToken.delete({ where: { id: stored.id } });
        throw new UnauthorizedException('Refresh token expired');
      }
      await this.prisma.refreshToken.delete({ where: { id: stored.id } });
      return this.issueTokens(payload.sub);
    } catch (e) {
      if (e instanceof UnauthorizedException) throw e;
      throw new UnauthorizedException('Invalid token');
    }
  }

  async logout(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, { secret: this.refreshSecret });
      await this.prisma.refreshToken.delete({ where: { jti: payload.jti } });
    } catch (e) {
      // Silent fail for logout - token might already be deleted or invalid
    }
  }
}
