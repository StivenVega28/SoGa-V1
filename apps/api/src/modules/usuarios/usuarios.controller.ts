import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { Permisos } from '../auth/decorators/permisos.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  ActualizarUsuarioDto,
  CrearUsuarioDto,
  ListarUsuariosQuery,
  RestablecerContrasenaDto,
} from './dto/usuario.dto';
import { UsuariosService } from './usuarios.service';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuarios: UsuariosService) {}

  @Get()
  @Permisos('usuarios')
  async listar(@Query() query: ListarUsuariosQuery) {
    const { data, meta } = await this.usuarios.listar(query);
    return { ok: true, data, meta };
  }

  @Get(':id')
  @Permisos('usuarios')
  async obtener(@Param('id', new ParseUUIDPipe()) id: string) {
    const data = await this.usuarios.obtener(id);
    return { ok: true, data };
  }

  @Post()
  @Roles('Administrador')
  async crear(@Body() dto: CrearUsuarioDto) {
    const data = await this.usuarios.crear(dto);
    return { ok: true, data };
  }

  @Patch(':id')
  @Roles('Administrador')
  async actualizar(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: ActualizarUsuarioDto,
    @Req() request: Request,
  ) {
    const data = await this.usuarios.actualizar(id, dto, request.usuario!.id);
    return { ok: true, data };
  }

  @Patch(':id/contrasena')
  @Roles('Administrador')
  async restablecerContrasena(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: RestablecerContrasenaDto,
  ) {
    await this.usuarios.restablecerContrasena(id, dto);
    return { ok: true };
  }

  @Delete(':id')
  @Roles('Administrador')
  async eliminar(@Param('id', new ParseUUIDPipe()) id: string, @Req() request: Request) {
    await this.usuarios.eliminar(id, request.usuario!.id);
    return { ok: true };
  }

  @Post(':id/restaurar')
  @Roles('Administrador')
  async restaurar(@Param('id', new ParseUUIDPipe()) id: string) {
    const data = await this.usuarios.restaurar(id);
    return { ok: true, data };
  }
}
