import type {
  AjusteInventarioPayload,
  CatalogoResponse,
  Categoria,
  Cliente,
  ClientePayload,
  Compra,
  CompraDetalle,
  CompraPayload,
  ContactPayload,
  FeaturedResponse,
  InventarioItem,
  Kardex,
  MetaPaginacion,
  PerfilResponse,
  ProductoAdmin,
  ProductoPayload,
  Proveedor,
  ProveedorPayload,
  Rol,
  RolPayload,
  Usuario,
  UsuarioPayload,
  Venta,
  VentaDetalle,
  VentaPayload,
} from './types';

const API_URL = import.meta.env.VITE_API_URL ?? '/api';

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string | string[] } | null;
    const detalle = Array.isArray(body?.message) ? body.message.join('. ') : body?.message;
    throw new ApiError(detalle ?? `Error ${res.status}`, res.status);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

function construirQuery<T extends object>(filtros: T): string {
  const params = new URLSearchParams();
  for (const [clave, valor] of Object.entries(filtros)) {
    if (valor !== undefined && valor !== '') params.set(clave, String(valor));
  }
  return params.toString();
}

export function getCatalogo(): Promise<CatalogoResponse> {
  return request<CatalogoResponse>('/catalogo');
}

export function getDestacado(): Promise<FeaturedResponse> {
  return request<FeaturedResponse>('/destacado');
}

export function enviarContacto(payload: ContactPayload): Promise<{ ok: boolean; message: string }> {
  return request('/contacto', { method: 'POST', body: JSON.stringify(payload) });
}

/* ------------------------------ Autenticación ------------------------------ */

export function iniciarSesion(correo: string, contrasena: string) {
  return request<{ redirect: boolean; user: unknown }>('/auth/sign-in/email', {
    method: 'POST',
    body: JSON.stringify({ email: correo, password: contrasena }),
  });
}

export function cerrarSesion() {
  return request<{ success: boolean }>('/auth/sign-out', { method: 'POST' });
}

export function obtenerPerfil() {
  return request<PerfilResponse>('/perfil');
}

/* -------------------------------- Productos -------------------------------- */

export interface FiltrosProductos {
  buscar?: string;
  categoriaId?: number;
  activo?: 'true' | 'false';
  pagina?: number;
  porPagina?: number;
}

export function listarProductos(filtros: FiltrosProductos = {}) {
  const query = construirQuery(filtros);
  return request<{ ok: boolean; data: ProductoAdmin[]; meta: MetaPaginacion }>(
    `/productos${query ? `?${query}` : ''}`,
  );
}

export function crearProducto(payload: ProductoPayload) {
  return request<{ ok: boolean; data: ProductoAdmin }>('/productos', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function actualizarProducto(id: number, payload: Partial<ProductoPayload>) {
  return request<{ ok: boolean; data: ProductoAdmin }>(`/productos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function cambiarEstadoProducto(id: number, activo: boolean) {
  return request<{ ok: boolean; data: ProductoAdmin }>(`/productos/${id}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ activo }),
  });
}

export function eliminarProducto(id: number) {
  return request<{ ok: boolean }>(`/productos/${id}`, { method: 'DELETE' });
}

export function listarCategorias() {
  return request<{ ok: boolean; data: Categoria[] }>('/categorias');
}

export function crearCategoria(payload: { nombre: string; descripcion?: string }) {
  return request<{ ok: boolean; data: Categoria }>('/categorias', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/* ------------------------------- Proveedores ------------------------------- */

export interface FiltrosProveedores {
  buscar?: string;
  pagina?: number;
  porPagina?: number;
}

export function listarProveedores(filtros: FiltrosProveedores = {}) {
  const query = construirQuery(filtros);
  return request<{ ok: boolean; data: Proveedor[]; meta: MetaPaginacion }>(
    `/proveedores${query ? `?${query}` : ''}`,
  );
}

export function crearProveedor(payload: ProveedorPayload) {
  return request<{ ok: boolean; data: Proveedor }>('/proveedores', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function actualizarProveedor(id: number, payload: Partial<ProveedorPayload>) {
  return request<{ ok: boolean; data: Proveedor }>(`/proveedores/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function eliminarProveedor(id: number) {
  return request<{ ok: boolean }>(`/proveedores/${id}`, { method: 'DELETE' });
}

/* --------------------------------- Clientes -------------------------------- */

export interface FiltrosClientes {
  buscar?: string;
  pagina?: number;
  porPagina?: number;
}

export function listarClientes(filtros: FiltrosClientes = {}) {
  const query = construirQuery(filtros);
  return request<{ ok: boolean; data: Cliente[]; meta: MetaPaginacion }>(
    `/clientes${query ? `?${query}` : ''}`,
  );
}

export function crearCliente(payload: ClientePayload) {
  return request<{ ok: boolean; data: Cliente }>('/clientes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function actualizarCliente(id: number, payload: Partial<ClientePayload>) {
  return request<{ ok: boolean; data: Cliente }>(`/clientes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function eliminarCliente(id: number) {
  return request<{ ok: boolean }>(`/clientes/${id}`, { method: 'DELETE' });
}

/* -------------------------------- Usuarios -------------------------------- */

export interface FiltrosUsuarios {
  buscar?: string;
  rolId?: number;
  estado?: 'activos' | 'eliminados';
  pagina?: number;
  porPagina?: number;
}

export function listarUsuarios(filtros: FiltrosUsuarios = {}) {
  const query = construirQuery(filtros);
  return request<{ ok: boolean; data: Usuario[]; meta: MetaPaginacion }>(
    `/usuarios${query ? `?${query}` : ''}`,
  );
}

export function listarRoles() {
  return request<{ ok: boolean; data: Rol[] }>('/roles');
}

export function crearRol(payload: RolPayload) {
  return request<{ ok: boolean; data: Rol }>('/roles', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function actualizarRol(id: number, payload: Partial<RolPayload>) {
  return request<{ ok: boolean; data: Rol }>(`/roles/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function eliminarRol(id: number) {
  return request<{ ok: boolean }>(`/roles/${id}`, { method: 'DELETE' });
}

export function crearUsuario(payload: UsuarioPayload) {
  return request<{ ok: boolean; data: Usuario }>('/usuarios', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function actualizarUsuario(id: string, payload: Partial<UsuarioPayload>) {
  return request<{ ok: boolean; data: Usuario }>(`/usuarios/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function restablecerContrasena(id: string, contrasena: string) {
  return request<{ ok: boolean }>(`/usuarios/${id}/contrasena`, {
    method: 'PATCH',
    body: JSON.stringify({ contrasena }),
  });
}

export function eliminarUsuario(id: string) {
  return request<{ ok: boolean }>(`/usuarios/${id}`, { method: 'DELETE' });
}

export function restaurarUsuario(id: string) {
  return request<{ ok: boolean; data: Usuario }>(`/usuarios/${id}/restaurar`, {
    method: 'POST',
  });
}

/* --------------------------------- Compras -------------------------------- */

export interface FiltrosCompras {
  buscar?: string;
  proveedorId?: number;
  pagina?: number;
  porPagina?: number;
}

export function listarCompras(filtros: FiltrosCompras = {}) {
  const query = construirQuery(filtros);
  return request<{ ok: boolean; data: Compra[]; meta: MetaPaginacion }>(
    `/compras${query ? `?${query}` : ''}`,
  );
}

export function obtenerCompra(id: number) {
  return request<{ ok: boolean; data: CompraDetalle }>(`/compras/${id}`);
}

export function crearCompra(payload: CompraPayload) {
  return request<{ ok: boolean; data: CompraDetalle }>('/compras', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/* --------------------------------- Ventas --------------------------------- */

export interface FiltrosVentas {
  buscar?: string;
  clienteId?: number;
  estado?: 'BORRADOR' | 'CONFIRMADA' | 'ANULADA';
  pagina?: number;
  porPagina?: number;
}

export function listarVentas(filtros: FiltrosVentas = {}) {
  const query = construirQuery(filtros);
  return request<{ ok: boolean; data: Venta[]; meta: MetaPaginacion }>(
    `/ventas${query ? `?${query}` : ''}`,
  );
}

export function obtenerVenta(id: number) {
  return request<{ ok: boolean; data: VentaDetalle }>(`/ventas/${id}`);
}

export function crearVenta(payload: VentaPayload) {
  return request<{ ok: boolean; data: VentaDetalle }>('/ventas', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/* ------------------------------- Inventario ------------------------------- */

export interface FiltrosInventario {
  buscar?: string;
  pagina?: number;
  porPagina?: number;
}

export function listarInventario(filtros: FiltrosInventario = {}) {
  const query = construirQuery(filtros);
  return request<{ ok: boolean; data: InventarioItem[]; meta: MetaPaginacion }>(
    `/inventario${query ? `?${query}` : ''}`,
  );
}

export function kardexInventario(productoId: number) {
  return request<{ ok: boolean; data: Kardex }>(`/inventario/${productoId}/movimientos`);
}

export function ajustarInventario(payload: AjusteInventarioPayload) {
  return request<{ ok: boolean; data: InventarioItem }>('/inventario/ajuste', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
