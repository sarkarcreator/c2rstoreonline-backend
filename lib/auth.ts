import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

export async function login(password: string) {
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' }, orderBy: { createdAt: 'asc' } });
  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) throw new Error('INVALID_CREDENTIALS');
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_NOT_CONFIGURED');
  return { token: jwt.sign({ sub: admin.id, role: admin.role, email: admin.email }, secret, { expiresIn: '8h' }), admin: { email: admin.email, name: admin.name, role: admin.role } };
}

export function verify(token?: string) {
  if (!token) throw new Error('UNAUTHORIZED');
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_NOT_CONFIGURED');
  try { return jwt.verify(token, secret) as { sub: string; role: string; email?: string }; }
  catch { throw new Error('UNAUTHORIZED'); }
}

export function requireAdmin(request: Request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || request.headers.get('cookie')?.match(/(?:^|;\s*)c2r_admin=([^;]+)/)?.[1];
  const payload = verify(token);
  if (payload.role !== 'ADMIN') throw new Error('FORBIDDEN');
  return payload;
}
