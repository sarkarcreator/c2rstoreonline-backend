import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
@Injectable() export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}
  async login(password: string) { const admin = await this.prisma.user.findFirst({ where: { role: 'ADMIN' }, orderBy: { createdAt: 'asc' } }); if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) throw new UnauthorizedException('Invalid credentials'); return { token: await this.jwt.signAsync({ sub: admin.id, role: admin.role, email: admin.email }), admin: { email: admin.email, name: admin.name, role: admin.role } }; }
  async verify(token?: string) { if (!token) throw new UnauthorizedException(); return this.jwt.verifyAsync<{ sub: string; role: string }>(token); }
}
