import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { ROLES } from '../decorators/roles.decorator';
import { PERMISOS_META } from '../decorators/permisos.decorator';
import { tienePermiso } from '../permisos.constants';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    // 1) Permisos por módulo (acceso de lectura a un módulo).
    const permisosRequeridos = this.reflector.getAllAndOverride<string[]>(PERMISOS_META, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (permisosRequeridos?.length) {
      const permisos = request.usuario?.rol?.permisos;
      if (!permisos) {
        throw new ForbiddenException('El rol no tiene permisos asignados.');
      }
      const autorizado = permisosRequeridos.some((requerido) => tienePermiso(permisos, requerido));
      if (!autorizado) {
        throw new ForbiddenException('No tienes permisos para acceder a este módulo.');
      }
      return true;
    }

    // 2) Roles por nombre (legacy, se usa para las mutaciones).
    const rolesRequeridos = this.reflector.getAllAndOverride<string[]>(ROLES, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Sin roles declarados: basta con estar autenticado (ya validado por SesionGuard).
    if (!rolesRequeridos?.length) return true;

    const rol = request.usuario?.rol?.nombre;
    if (!rol) {
      throw new ForbiddenException('El usuario no tiene un rol asignado.');
    }
    if (!rolesRequeridos.includes(rol)) {
      throw new ForbiddenException('No tienes permisos para realizar esta acción.');
    }

    return true;
  }
}
