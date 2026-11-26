import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { Permisos } from '../auth/decorators/permisos.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { ActualizarRolDto, CrearRolDto } from './dto/rol.dto';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
  constructor(private readonly roles: RolesService) {}

  @Get()
  @Permisos('usuarios')
  async listar() {
    const data = await this.roles.listar();
    return { ok: true, data };
  }

  @Post()
  @Roles('Administrador')
  async crear(@Body() dto: CrearRolDto) {
    const data = await this.roles.crear(dto);
    return { ok: true, data };
  }

  @Patch(':id')
  @Roles('Administrador')
  async actualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: ActualizarRolDto) {
    const data = await this.roles.actualizar(id, dto);
    return { ok: true, data };
  }

  @Delete(':id')
  @Roles('Administrador')
  async eliminar(@Param('id', ParseIntPipe) id: number) {
    await this.roles.eliminar(id);
    return { ok: true };
  }
}
