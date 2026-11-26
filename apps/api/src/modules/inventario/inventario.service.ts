import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { stockPorProducto } from '../../common/stock.util';
import { AjustarInventarioDto, ListarInventarioQuery } from './dto/inventario.dto';

export interface InventarioSalida {
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

const INCLUDE_INVENTARIO = {
  categoria: { select: { nombre: true } },
  proveedor: { select: { nombre: true } },
} satisfies Prisma.ProductoInclude;

type ProductoInventario = Prisma.ProductoGetPayload<{
  include: typeof INCLUDE_INVENTARIO;
}>;

@Injectable()
export class InventarioService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lista productos con su stock derivado del kardex.
   * Como el stock no se guarda en `productos`, se calcula en una segunda consulta
   * (groupBy sobre `movimientos_inventario`) y se cruza con la página de productos.
   */
  async listar(query: ListarInventarioQuery) {
    const pagina = query.pagina ?? 1;
    const porPagina = query.porPagina ?? 20;
    const buscar = query.buscar?.trim();

    const where: Prisma.ProductoWhereInput = {
      eliminadoEn: null,
      ...(buscar
        ? {
            OR: [
              { nombre: { contains: buscar } },
              { sku: { contains: buscar } },
              { categoria: { nombre: { contains: buscar } } },
            ],
          }
        : {}),
    };

    const [total, filas] = await this.prisma.$transaction([
      this.prisma.producto.count({ where }),
      this.prisma.producto.findMany({
        where,
        include: INCLUDE_INVENTARIO,
        orderBy: [{ nombre: 'asc' }],
        skip: (pagina - 1) * porPagina,
        take: porPagina,
      }),
    ]);

    const stock = await this.prisma.$transaction((tx) =>
      stockPorProducto(tx, filas.map((fila) => fila.id)),
    );

    return {
      data: filas.map((fila) => this.toSalida(fila, stock.get(fila.id) ?? 0)),
      meta: {
        total,
        pagina,
        porPagina,
        paginas: Math.max(1, Math.ceil(total / porPagina)),
      },
    };
  }

  async kardex(productoId: number) {
    const producto = await this.prisma.producto.findFirst({
      where: { id: productoId, eliminadoEn: null },
      select: { id: true, nombre: true, sku: true },
    });
    if (!producto) throw new NotFoundException('Producto no encontrado.');

    const movimientos = await this.prisma.movimientoInventario.findMany({
      where: { productoId },
      orderBy: [{ ocurridoEn: 'desc' }, { id: 'desc' }],
    });

    return {
      producto,
      movimientos: movimientos.map((movimiento) => ({
        id: movimiento.id,
        tipo: movimiento.tipo,
        cantidad: movimiento.cantidad,
        costoUnitario: movimiento.costoUnitario?.toFixed(2) ?? null,
        tipoReferencia: movimiento.tipoReferencia,
        referenciaId: movimiento.referenciaId,
        nota: movimiento.nota,
        ocurridoEn: movimiento.ocurridoEn,
      })),
    };
  }

  /**
   * Ajuste manual de stock: crea un movimiento `AJUSTE` con cantidad con signo
   * (positiva suma, negativa resta). No permite dejar el stock en negativo.
   */
  async ajustar(dto: AjustarInventarioDto): Promise<InventarioSalida> {
    if (dto.cantidad === 0) {
      throw new BadRequestException('La cantidad del ajuste no puede ser cero.');
    }

    return this.prisma.$transaction(async (tx) => {
      const producto = await tx.producto.findFirst({
        where: { id: dto.productoId, eliminadoEn: null },
        include: INCLUDE_INVENTARIO,
      });
      if (!producto) throw new NotFoundException('Producto no encontrado.');

      const [stock] = await Promise.all([
        stockPorProducto(tx, [dto.productoId]),
      ]);
      const actual = stock.get(dto.productoId) ?? 0;
      if (actual + dto.cantidad < 0) {
        throw new BadRequestException(
          `El ajuste dejaría el stock en negativo (actual: ${actual}).`,
        );
      }

      await tx.movimientoInventario.create({
        data: {
          productoId: dto.productoId,
          tipo: 'AJUSTE',
          cantidad: dto.cantidad,
          tipoReferencia: 'ajuste',
          nota: dto.nota?.trim() || null,
          ocurridoEn: new Date(),
        },
      });

      return this.toSalida(producto, actual + dto.cantidad);
    });
  }

  private toSalida(producto: ProductoInventario, stock: number): InventarioSalida {
    return {
      id: producto.id,
      sku: producto.sku,
      nombre: producto.nombre,
      categoria: producto.categoria.nombre,
      proveedor: producto.proveedor?.nombre ?? null,
      unidad: producto.unidad,
      stock,
      stockMinimo: producto.stockMinimo,
      costo: producto.costo.toFixed(2),
      precio: producto.precio.toFixed(2),
      bajoMinimo: stock <= producto.stockMinimo,
    };
  }
}
