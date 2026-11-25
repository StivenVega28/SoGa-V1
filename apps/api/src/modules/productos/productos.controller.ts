import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  ActualizarProductoDto,
  CambiarEstadoDto,
  CrearProductoDto,
  ListarProductosQuery,
} from './dto/producto.dto';
import { ProductosService } from './productos.service';

@Controller('productos')
export class ProductosController {
  constructor(private readonly productos: ProductosService) {}

  @Get()
  @Roles('Administrador', 'Vendedor', 'Consultor')
  async listar(@Query() query: ListarProductosQuery) {
    const { data, meta } = await this.productos.listar(query);
    return { ok: true, data, meta };
  }

  @Get(':id')
  @Roles('Administrador', 'Vendedor', 'Consultor')
  async obtener(@Param('id', ParseIntPipe) id: number) {
    const data = await this.productos.obtener(id);
    return { ok: true, data };
  }

  @Post()
  @Roles('Administrador')
  async crear(@Body() dto: CrearProductoDto) {
    const data = await this.productos.crear(dto);
    return { ok: true, data };
  }

  @Patch(':id')
  @Roles('Administrador')
  async actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarProductoDto,
  ) {
    const data = await this.productos.actualizar(id, dto);
    return { ok: true, data };
  }

  @Patch(':id/estado')
  @Roles('Administrador')
  async cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CambiarEstadoDto,
  ) {
    const data = await this.productos.cambiarEstado(id, dto.activo);
    return { ok: true, data };
  }

  @Delete(':id')
  @Roles('Administrador')
  async eliminar(@Param('id', ParseIntPipe) id: number) {
    await this.productos.eliminar(id);
    return { ok: true };
  }
}
