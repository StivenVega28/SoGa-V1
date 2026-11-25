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

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const esPublico = this.reflector.getAllAndOverride<boolean>(ES_PUBLICO, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (esPublico) return true;

    const request = context.switchToHttp().getRequest<Request>();
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

    request.usuario = usuario;
    request.sesion = sesion.session;
    return true;
  }
}
