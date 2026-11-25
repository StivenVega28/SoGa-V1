import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { SesionGuard } from './modules/auth/guards/sesion.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { CatalogModule } from './modules/catalog/catalog.module';
import { ContactModule } from './modules/contact/contact.module';
import { ProductosModule } from './modules/productos/productos.module';
import { ProveedoresModule } from './modules/proveedores/proveedores.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env', '../../.env'] }),
    PrismaModule,
    AuthModule,
    CatalogModule,
    ContactModule,
    ProductosModule,
    ProveedoresModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: SesionGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
