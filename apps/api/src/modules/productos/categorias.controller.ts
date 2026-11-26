import { Body, Controller, Get, Post } from '@nestjs/common';
import { Permisos } from '../auth/decorators/permisos.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CrearCategoriaDto } from './dto/producto.dto';
import { ProductosService } from './productos.service';

@Controller('categorias')
export class CategoriasController {
  constructor(private readonly productos: ProductosService) {}

  @Get()
  @Permisos('productos')
  async listar() {
    const data = await this.productos.listarCategorias();
    return { ok: true, data };
  }

  @Post()
  @Roles('Administrador')
  async crear(@Body() dto: CrearCategoriaDto) {
    const data = await this.productos.crearCategoria(dto);
    return { ok: true, data };
  }
}
