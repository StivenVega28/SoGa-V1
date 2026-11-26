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
import { Permisos } from '../auth/decorators/permisos.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  ActualizarProveedorDto,
  CrearProveedorDto,
  ListarProveedoresQuery,
} from './dto/proveedor.dto';
import { ProveedoresService } from './proveedores.service';

@Controller('proveedores')
export class ProveedoresController {
  constructor(private readonly proveedores: ProveedoresService) {}

  @Get()
  @Permisos('proveedores')
  async listar(@Query() query: ListarProveedoresQuery) {
    const { data, meta } = await this.proveedores.listar(query);
    return { ok: true, data, meta };
  }

  @Get(':id')
  @Permisos('proveedores')
  async obtener(@Param('id', ParseIntPipe) id: number) {
    const data = await this.proveedores.obtener(id);
    return { ok: true, data };
  }

  @Post()
  @Roles('Administrador')
  async crear(@Body() dto: CrearProveedorDto) {
    const data = await this.proveedores.crear(dto);
    return { ok: true, data };
  }

  @Patch(':id')
  @Roles('Administrador')
  async actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarProveedorDto,
  ) {
    const data = await this.proveedores.actualizar(id, dto);
    return { ok: true, data };
  }

  @Delete(':id')
  @Roles('Administrador')
  async eliminar(@Param('id', ParseIntPipe) id: number) {
    await this.proveedores.eliminar(id);
    return { ok: true };
  }
}
