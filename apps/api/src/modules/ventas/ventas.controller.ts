import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { Permisos } from '../auth/decorators/permisos.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CrearVentaDto, ListarVentasQuery } from './dto/venta.dto';
import { VentasService } from './ventas.service';

@Controller('ventas')
export class VentasController {
  constructor(private readonly ventas: VentasService) {}

  @Get()
  @Permisos('ventas')
  async listar(@Query() query: ListarVentasQuery) {
    const { data, meta } = await this.ventas.listar(query);
    return { ok: true, data, meta };
  }

  @Get(':id')
  @Permisos('ventas')
  async obtener(@Param('id', ParseIntPipe) id: number) {
    const data = await this.ventas.obtener(id);
    return { ok: true, data };
  }

  @Post()
  @Roles('Administrador', 'Vendedor')
  async crear(@Body() dto: CrearVentaDto) {
    const data = await this.ventas.crear(dto);
    return { ok: true, data };
  }
}
