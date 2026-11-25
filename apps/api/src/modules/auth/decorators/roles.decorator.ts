import { SetMetadata } from '@nestjs/common';

export const ROLES = 'roles';

/** Declara los roles permitidos para una ruta. Sin este decorador, cualquier usuario autenticado entra. */
export const Roles = (...roles: string[]) => SetMetadata(ROLES, roles);
