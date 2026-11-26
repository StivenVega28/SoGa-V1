import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { fromNodeHeaders } from 'better-auth/node';
import type { Request } from 'express';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuthService } from '../auth.service';
import { ES_PUBLICO } from '../decorators/publico.decorator';

@Injectable()
export class SesionGuard implements CanActivate {
  constructor(
    private readonly auth: AuthService,
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Guard global: exige una sesión válida de Better Auth en todas las rutas,
   * salvo las marcadas con `@Publico()`.
   *
   * Si la sesión es válida, carga el usuario con su rol (incluye `permisos`) y lo
   * deja disponible en `request.usuario` para que `RolesGuard` y los controladores
   * lo usen. Rechaza usuarios dados de baja (`eliminadoEn != null`).
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const esPublico = this.reflector.getAllAndOverride<boolean>(ES_PUBLICO, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (esPublico) return true;

    const request = context.switchToHttp().getRequest<Request>();
    // Better Auth resuelve la sesión a partir de la cookie `httpOnly` de la petición.
    const sesion = await this.auth.auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });

    if (!sesion) {
      throw new UnauthorizedException('Sesión no válida o expirada.');
    }

    const usuario = await this.prisma.usuario.findFirst({
      where: { id: sesion.user.id, eliminadoEn: null },
      include: { rol: true },
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuario no habilitado.');
    }

    // Expone el usuario y la sesión al resto de la petición (tipados en express.d.ts).
    request.usuario = usuario;
    request.sesion = sesion.session;
    return true;
  }
}
