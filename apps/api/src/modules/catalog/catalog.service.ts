import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface ProductoDto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  imagen: string | null;
  proveedor: string | null;
}

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<ProductoDto[]> {
    const products = await this.prisma.product.findMany({
      where: { active: true, deletedAt: null },
      include: { supplier: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    return products.map((product) => this.toDto(product));
  }

  async findFeatured(): Promise<ProductoDto | null> {
    const product = await this.prisma.product.findFirst({
      where: { active: true, deletedAt: null },
      include: { supplier: true },
      orderBy: { price: 'desc' },
    });

    return product ? this.toDto(product) : null;
  }

  private toDto(product: {
    id: number;
    name: string;
    description: string;
    price: { toNumber(): number } | number;
    category: string;
    image: string | null;
    supplier: { name: string } | null;
  }): ProductoDto {
    return {
      id: product.id,
      nombre: product.name,
      descripcion: product.description,
      precio: typeof product.price === 'number' ? product.price : product.price.toNumber(),
      categoria: product.category,
      imagen: product.image,
      proveedor: product.supplier?.name ?? null,
    };
  }
}
