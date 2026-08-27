import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { CatalogModule } from './catalog/catalog.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { FormsModule } from './forms/forms.module';
import { AiModule } from './ai/ai.module';
import { AffiliatesModule } from './affiliates/affiliates.module';

@Module({ imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env.local', '.env'], validate: config => { if (config.NODE_ENV === 'production') for (const key of ['DATABASE_URL', 'JWT_SECRET', 'FRONTEND_URL']) if (!config[key]) throw new Error(`${key} is required in production`); if (config.JWT_SECRET && config.JWT_SECRET.length < 32) throw new Error('JWT_SECRET must be at least 32 characters'); return config; } }), ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]), PrismaModule, CatalogModule, AuthModule, AdminModule, FormsModule, AiModule, AffiliatesModule] })
export class AppModule {}
