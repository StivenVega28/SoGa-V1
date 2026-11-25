import type {
  CatalogoResponse,
  Categoria,
  ContactPayload,
  FeaturedResponse,
  MetaPaginacion,
  PerfilResponse,
  ProductoAdmin,
  ProductoPayload,
  Proveedor,
  ProveedorPayload,
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
  const params = new URLSearchParams();
  for (const [clave, valor] of Object.entries(filtros)) {
    if (valor !== undefined && valor !== '') params.set(clave, String(valor));
  }
  const query = params.toString();
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
  const params = new URLSearchParams();
  for (const [clave, valor] of Object.entries(filtros)) {
    if (valor !== undefined && valor !== '') params.set(clave, String(valor));
  }
  const query = params.toString();
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
