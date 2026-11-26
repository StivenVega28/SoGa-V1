/** Catálogo de permisos por módulo (espejo del backend). */
export const PERMISOS_DISPONIBLES = [
  { valor: 'productos', etiqueta: 'Productos y categorías' },
  { valor: 'proveedores', etiqueta: 'Proveedores' },
  { valor: 'clientes', etiqueta: 'Clientes' },
  { valor: 'compras', etiqueta: 'Compras' },
  { valor: 'ventas', etiqueta: 'Ventas' },
  { valor: 'inventario', etiqueta: 'Inventario' },
  { valor: 'usuarios', etiqueta: 'Usuarios y roles' },
  { valor: 'cotizaciones', etiqueta: 'Cotizaciones' },
] as const;

export const PERMISO_TODOS = 'todos';

export function parsearPermisos(permisos: string | null | undefined): string[] {
  if (!permisos) return [];
  return permisos
    .split(',')
    .map((permiso) => permiso.trim().toLowerCase())
    .filter(Boolean);
}

export function tienePermiso(
  permisos: string | null | undefined,
  requerido: string,
): boolean {
  const lista = parsearPermisos(permisos);
  return lista.includes(PERMISO_TODOS) || lista.includes(requerido);
}
