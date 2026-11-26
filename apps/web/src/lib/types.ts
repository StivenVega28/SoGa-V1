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

export interface Cliente {
  id: number;
  nit: string;
  nombre: string;
  apellido: string | null;
  ciudad: string;
  sucursal: string | null;
  direccion: string;
  telefono: string;
  correo: string;
  ventas: number;
  cotizaciones: number;
  creadoEn: string;
  actualizadoEn: string;
}

export interface ClientePayload {
  nit: string;
  nombre: string;
  apellido?: string;
  ciudad: string;
  sucursal?: string;
  direccion: string;
  telefono: string;
  correo: string;
}

export interface Rol {
  id: number;
  nombre: string;
  descripcion: string;
  permisos: string;
  usuarios?: number;
}

export interface RolPayload {
  nombre: string;
  descripcion?: string;
  permisos: string[];
}

export interface Usuario {
  id: string;
  rolId: number | null;
  rol: { id: number; nombre: string } | null;
  documento: string | null;
  nombre: string;
  apellido: string | null;
  telefono: string | null;
  correo: string;
  correoVerificado: boolean;
  imagen: string | null;
  eliminadoEn: string | null;
  creadoEn: string;
  actualizadoEn: string;
}

export interface UsuarioPayload {
  nombre: string;
  apellido?: string | null;
  documento?: string | null;
  telefono?: string | null;
  correo: string;
  rolId: number;
  contrasena?: string;
}

/* -------------------------------- Compras -------------------------------- */

export interface CompraItem {
  id: number;
  productoId: number;
  sku: string;
  producto: string;
  cantidad: number;
  costoUnitario: string;
  totalLinea: string;
}

export interface Compra {
  id: number;
  proveedor: { id: number; nombre: string };
  total: string;
  compradoEn: string;
  creadoEn: string;
  items: number;
}

export interface CompraDetalle extends Omit<Compra, 'items'> {
  items: CompraItem[];
}

export interface CompraItemPayload {
  productoId: number;
  cantidad: number;
  costoUnitario: string;
}

export interface CompraPayload {
  proveedorId: number;
  compradoEn?: string;
  items: CompraItemPayload[];
}

/* --------------------------------- Ventas -------------------------------- */

export interface VentaItem {
  id: number;
  productoId: number;
  sku: string;
  producto: string;
  cantidad: number;
  precioUnitario: string;
  totalLinea: string;
}

export interface Venta {
  id: number;
  cliente: { id: number; nombre: string; apellido: string | null };
  emitidaEn: string;
  subtotal: string;
  impuesto: string;
  total: string;
  estado: string;
  items: number;
}

export interface VentaDetalle extends Omit<Venta, 'items'> {
  notas: string | null;
  items: VentaItem[];
}

export interface VentaItemPayload {
  productoId: number;
  cantidad: number;
  precioUnitario?: string;
}

export interface VentaPayload {
  clienteId: number;
  emitidaEn?: string;
  notas?: string;
  items: VentaItemPayload[];
}

/* ------------------------------- Inventario ------------------------------- */

export interface InventarioItem {
  id: number;
  sku: string;
  nombre: string;
  categoria: string;
  proveedor: string | null;
  unidad: string;
  stock: number;
  stockMinimo: number;
  costo: string;
  precio: string;
  bajoMinimo: boolean;
}

export interface MovimientoInventario {
  id: number;
  tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE' | 'ANULACION';
  cantidad: number;
  costoUnitario: string | null;
  tipoReferencia: string | null;
  referenciaId: number | null;
  nota: string | null;
  ocurridoEn: string;
}

export interface Kardex {
  producto: { id: number; nombre: string; sku: string };
  movimientos: MovimientoInventario[];
}

export interface AjusteInventarioPayload {
  productoId: number;
  cantidad: number;
  nota?: string;
}
