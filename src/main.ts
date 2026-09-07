import 'reflect-metadata';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const origins = (config.get<string>('ALLOWED_ORIGINS') || config.get<string>('FRONTEND_URL') || 'http://localhost:3000')
    .split(',')
    .map((v: string) => v.trim())
    .filter(Boolean);

  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({
    origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) =>
      !origin || origins.includes(origin)
        ? callback(null, true)
        : callback(new Error('Origin is not allowed')),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.setGlobalPrefix('api');

  const port = Number(process.env.PORT || config.get<string>('PORT') || 4000);
  await app.listen(port, '0.0.0.0');
}

bootstrap();
