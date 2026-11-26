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
  ActualizarClienteDto,
  CrearClienteDto,
  ListarClientesQuery,
} from './dto/cliente.dto';
import { ClientesService } from './clientes.service';

@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientes: ClientesService) {}

  @Get()
  @Roles('Administrador', 'Vendedor')
  async listar(@Query() query: ListarClientesQuery) {
    const { data, meta } = await this.clientes.listar(query);
    return { ok: true, data, meta };
  }

  @Get(':id')
  @Roles('Administrador', 'Vendedor')
  async obtener(@Param('id', ParseIntPipe) id: number) {
    const data = await this.clientes.obtener(id);
    return { ok: true, data };
  }

  @Post()
  @Roles('Administrador', 'Vendedor')
  async crear(@Body() dto: CrearClienteDto) {
    const data = await this.clientes.crear(dto);
    return { ok: true, data };
  }

  @Patch(':id')
  @Roles('Administrador', 'Vendedor')
  async actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ActualizarClienteDto,
  ) {
    const data = await this.clientes.actualizar(id, dto);
    return { ok: true, data };
  }

  @Delete(':id')
  @Roles('Administrador')
  async eliminar(@Param('id', ParseIntPipe) id: number) {
    await this.clientes.eliminar(id);
    return { ok: true };
  }
}
