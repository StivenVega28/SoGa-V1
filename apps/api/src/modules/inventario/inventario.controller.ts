import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { Permisos } from '../auth/decorators/permisos.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AjustarInventarioDto, ListarInventarioQuery } from './dto/inventario.dto';
import { InventarioService } from './inventario.service';

@Controller('inventario')
export class InventarioController {
  constructor(private readonly inventario: InventarioService) {}

  @Get()
  @Permisos('inventario')
  async listar(@Query() query: ListarInventarioQuery) {
    const { data, meta } = await this.inventario.listar(query);
    return { ok: true, data, meta };
  }

  @Get(':id/movimientos')
  @Permisos('inventario')
  async kardex(@Param('id', ParseIntPipe) id: number) {
    const data = await this.inventario.kardex(id);
    return { ok: true, data };
  }

  @Post('ajuste')
  @Roles('Administrador')
  async ajustar(@Body() dto: AjustarInventarioDto) {
    const data = await this.inventario.ajustar(dto);
    return { ok: true, data };
  }
}
