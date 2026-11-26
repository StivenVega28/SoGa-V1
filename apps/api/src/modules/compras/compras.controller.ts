import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { Permisos } from '../auth/decorators/permisos.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CrearCompraDto, ListarComprasQuery } from './dto/compra.dto';
import { ComprasService } from './compras.service';

@Controller('compras')
export class ComprasController {
  constructor(private readonly compras: ComprasService) {}

  @Get()
  @Permisos('compras')
  async listar(@Query() query: ListarComprasQuery) {
    const { data, meta } = await this.compras.listar(query);
    return { ok: true, data, meta };
  }

  @Get(':id')
  @Permisos('compras')
  async obtener(@Param('id', ParseIntPipe) id: number) {
    const data = await this.compras.obtener(id);
    return { ok: true, data };
  }

  @Post()
  @Roles('Administrador')
  async crear(@Body() dto: CrearCompraDto) {
    const data = await this.compras.crear(dto);
    return { ok: true, data };
  }
}
