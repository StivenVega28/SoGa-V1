export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  imagen: string | null;
  proveedor: string | null;
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
