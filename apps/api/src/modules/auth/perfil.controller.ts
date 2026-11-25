import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';

@Controller('perfil')
export class PerfilController {
  @Get()
  obtener(@Req() request: Request) {
    const usuario = request.usuario;

    return {
      ok: true,
      usuario: usuario
        ? {
            id: usuario.id,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            correo: usuario.correo,
            documento: usuario.documento,
            telefono: usuario.telefono,
            imagen: usuario.imagen,
            rol: usuario.rol?.nombre ?? null,
            permisos: usuario.rol?.permisos ?? null,
          }
        : null,
      sesion: request.sesion
        ? { expiraEn: request.sesion.expiresAt, creadaEn: request.sesion.createdAt }
        : null,
    };
  }
}
