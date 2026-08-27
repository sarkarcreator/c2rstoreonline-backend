import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../auth/auth.service';
@Injectable() export class AdminGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}
  async canActivate(context: ExecutionContext) { const request = context.switchToHttp().getRequest(); const token = request.cookies?.c2r_admin || request.headers.authorization?.replace(/^Bearer\s+/i, ''); if (!token) throw new UnauthorizedException(); const payload = await this.auth.verify(token); if (payload.role !== 'ADMIN') throw new ForbiddenException(); request.user = payload; return true; }
}
