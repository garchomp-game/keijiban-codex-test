import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const auth = request.headers['authorization'];
    if (!auth || typeof auth !== 'string' || !auth.startsWith('Bearer ')) {
      throw new UnauthorizedException();
    }
    const token = auth.slice(7);
    // simple demo validation
    if (token !== 'fake-access-token') {
      throw new UnauthorizedException();
    }
    request.user = { userId: 'user-1', role: 'user' };
    return true;
  }
}
