import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AdminGuard } from '../common/guards/admin.guard';
@Module({ imports: [ConfigModule, JwtModule.registerAsync({ imports: [ConfigModule], inject: [ConfigService], useFactory: (config: ConfigService) => ({ secret: config.getOrThrow<string>('JWT_SECRET'), signOptions: { expiresIn: '8h' } }) })], providers: [AuthService, AdminGuard], exports: [AuthService, AdminGuard, JwtModule] }) export class AuthModule {}
