import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AuthModule } from '../auth/auth.module';
import { CatalogModule } from '../catalog/catalog.module';
@Module({ imports: [AuthModule, CatalogModule], controllers: [AdminController] }) export class AdminModule {}
