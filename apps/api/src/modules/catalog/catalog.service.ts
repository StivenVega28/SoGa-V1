import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface ProductoDto {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  imagenes: string[];
  proveedor: string | null;
  destacado: boolean;
}

type ProductoRegistro = {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: { nombre: string };
  imagen: string | null;
  imagenes: Prisma.JsonValue;
  destacado: boolean;
  proveedor: { nombre: string } | null;
};

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ProductoDto[]> {
    const productos = await this.prisma.producto.findMany({
      where: { activo: true, eliminadoEn: null },
      include: { proveedor: true, categoria: true },
      orderBy: [{ categoria: { nombre: 'asc' } }, { nombre: 'asc' }],
    });

    return productos.map((producto) => this.toDto(producto));
  }

  async findFeatured(): Promise<ProductoDto | null> {
    const producto =
      (await this.prisma.producto.findFirst({
        where: { activo: true, eliminadoEn: null, destacado: true },
        include: { proveedor: true, categoria: true },
        orderBy: { id: 'asc' },
      })) ??
      (await this.prisma.producto.findFirst({
        where: { activo: true, eliminadoEn: null },
        include: { proveedor: true, categoria: true },
        orderBy: { id: 'asc' },
      }));

    return producto ? this.toDto(producto) : null;
  }

  private toDto(producto: ProductoRegistro): ProductoDto {
    return {
      id: producto.id,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      categoria: producto.categoria.nombre,
      imagenes: this.toImagenes(producto),
      proveedor: producto.proveedor?.nombre ?? null,
      destacado: producto.destacado,
    };
  }

  /**
   * `imagenes` llega como JSON desde MySQL; si el registro no tiene galería
   * usamos la imagen principal como única foto.
   */
  private toImagenes(producto: Pick<ProductoRegistro, 'imagenes' | 'imagen'>): string[] {
    if (Array.isArray(producto.imagenes)) {
      const urls = producto.imagenes.filter((valor): valor is string => typeof valor === 'string');
      if (urls.length > 0) return urls;
    }
    return producto.imagen ? [producto.imagen] : [];
  }
}
