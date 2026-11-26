/** Catálogo de permisos por módulo. `todos` otorga acceso completo (rol Administrador). */
export const PERMISOS_DISPONIBLES = [
  'productos',
  'proveedores',
  'clientes',
  'compras',
  'ventas',
  'inventario',
  'usuarios',
  'cotizaciones',
] as const;

export type Permiso = (typeof PERMISOS_DISPONIBLES)[number];

export const PERMISO_TODOS = 'todos';

export function esPermisoValido(valor: string): boolean {
  return valor === PERMISO_TODOS || (PERMISOS_DISPONIBLES as readonly string[]).includes(valor);
}

/** Convierte el texto separado por comas de `rol.permisos` en una lista limpia. */
export function parsearPermisos(permisos: string): string[] {
  return permisos
    .split(',')
    .map((permiso) => permiso.trim().toLowerCase())
    .filter(Boolean);
}

/** Indica si un rol (según su texto de permisos) tiene acceso a un permiso requerido. */
export function tienePermiso(permisosRol: string, requerido: string): boolean {
  const permisos = parsearPermisos(permisosRol);
  return permisos.includes(PERMISO_TODOS) || permisos.includes(requerido);
}
