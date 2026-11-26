import { SetMetadata } from '@nestjs/common';

export const PERMISOS_META = 'permisos';

/** Declara los permisos por módulo requeridos para una ruta. */
export const Permisos = (...permisos: string[]) => SetMetadata(PERMISOS_META, permisos);
