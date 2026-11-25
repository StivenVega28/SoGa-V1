export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  imagenes: string[];
  proveedor: string | null;
  destacado: boolean;
}

export interface CatalogoResponse {
  ok: boolean;
  data: Producto[];
}

export interface FeaturedResponse {
  ok: boolean;
  data: Producto | null;
}

export interface ContactPayload {
  nombre: string;
  apellido?: string;
  correo: string;
  telefono?: string;
  asunto: string;
  mensaje: string;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
  productos?: number;
}

export interface VarianteAdmin {
  id: number;
  sku: string;
  nombre: string;
  precio: string | null;
  activo: boolean;
}

export interface ProductoAdmin {
  id: number;
  sku: string;
  nombre: string;
  descripcion: string;
  precio: string;
  costo: string;
  unidad: string;
  stockMinimo: number;
  categoria: Categoria;
  proveedor: { id: number; nombre: string } | null;
  imagen: string | null;
  imagenes: string[];
  destacado: boolean;
  activo: boolean;
  variantes: VarianteAdmin[];
}

export interface MetaPaginacion {
  total: number;
  pagina: number;
  porPagina: number;
  paginas: number;
}

export interface Perfil {
  id: string;
  nombre: string;
  apellido: string | null;
  correo: string;
  documento: string | null;
  telefono: string | null;
  imagen: string | null;
  rol: string | null;
  permisos: string | null;
}

export interface PerfilResponse {
  ok: boolean;
  usuario: Perfil | null;
  sesion: { expiraEn: string; creadaEn: string } | null;
}

export interface Proveedor {
  id: number;
  nit: string;
  nombre: string;
  ciudad: string;
  direccion: string;
  telefono: string;
  correo: string;
  descripcion: string | null;
  productos: number;
  compras: number;
}

export interface ProveedorPayload {
  nit: string;
  nombre: string;
  ciudad: string;
  direccion: string;
  telefono: string;
  correo: string;
  descripcion?: string;
}

export interface VariantePayload {
  id?: number;
  nombre: string;
  sku: string;
  precio?: string;
  activo?: boolean;
}

export interface ProductoPayload {
  sku: string;
  nombre: string;
  descripcion: string;
  precio: string;
  costo?: string;
  categoriaId: number;
  proveedorId?: number | null;
  unidad?: string;
  stockMinimo?: number;
  imagen?: string;
  imagenes?: string[];
  destacado?: boolean;
  activo?: boolean;
  variantes?: VariantePayload[];
}
