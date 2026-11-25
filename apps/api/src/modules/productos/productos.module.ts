import { Module } from '@nestjs/common';
import { CategoriasController } from './categorias.controller';
import { ProductosController } from './productos.controller';
import { ProductosService } from './productos.service';

@Module({
  controllers: [ProductosController, CategoriasController],
  providers: [ProductosService],
})
export class ProductosModule {}
