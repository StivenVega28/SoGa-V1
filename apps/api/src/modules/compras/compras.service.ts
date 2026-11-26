import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { bloquearProductos, stockPorProducto } from '../../common/stock.util';
import { CrearCompraDto, ListarComprasQuery } from './dto/compra.dto';

const INCLUDE_COMPRA = {
  proveedor: { select: { id: true, nombre: true } },
  _count: { select: { detalles: true } },
} satisfies Prisma.CompraInclude;

type CompraLista = Prisma.CompraGetPayload<{ include: typeof INCLUDE_COMPRA }>;

const INCLUDE_COMPRA_DETALLE = {
  proveedor: { select: { id: true, nombre: true } },
  detalles: {
    include: { producto: { select: { id: true, sku: true, nombre: true } } },
    orderBy: { id: 'asc' as const },
  },
} satisfies Prisma.CompraInclude;

type CompraDetalle = Prisma.CompraGetPayload<{ include: typeof INCLUDE_COMPRA_DETALLE }>;

export interface CompraSalida {
  id: number;
  proveedor: { id: number; nombre: string };
  total: string;
  compradoEn: Date;
  creadoEn: Date;
  items: number;
}

export interface CompraDetalleSalida extends Omit<CompraSalida, 'items'> {
  items: Array<{
    id: number;
    productoId: number;
    sku: string;
    producto: string;
    cantidad: number;
    costoUnitario: string;
    totalLinea: string;
  }>;
}

@Injectable()
export class ComprasService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(query: ListarComprasQuery) {
    const pagina = query.pagina ?? 1;
    const porPagina = query.porPagina ?? 20;
    const buscar = query.buscar?.trim();

    const where: Prisma.CompraWhereInput = {
      ...(query.proveedorId ? { proveedorId: query.proveedorId } : {}),
      ...(buscar ? { proveedor: { nombre: { contains: buscar } } } : {}),
    };

    const [total, filas] = await this.prisma.$transaction([
      this.prisma.compra.count({ where }),
      this.prisma.compra.findMany({
        where,
        include: INCLUDE_COMPRA,
        orderBy: [{ compradoEn: 'desc' }, { id: 'desc' }],
        skip: (pagina - 1) * porPagina,
        take: porPagina,
      }),
    ]);

    return {
      data: filas.map((fila) => this.toSalida(fila)),
      meta: {
        total,
        pagina,
        porPagina,
        paginas: Math.max(1, Math.ceil(total / porPagina)),
      },
    };
  }

  async obtener(id: number): Promise<CompraDetalleSalida> {
    const compra = await this.prisma.compra.findUnique({
      where: { id },
      include: INCLUDE_COMPRA_DETALLE,
    });
    if (!compra) throw new NotFoundException('Compra no encontrada.');
    return this.toSalidaDetalle(compra);
  }

  /**
   * Registra una compra (cabecera + detalle) y su entrada al inventario.
   *
   * Todo ocurre en una sola transacción para garantizar consistencia:
   * 1. Bloquea las filas de producto (`FOR UPDATE`) para serializar el kardex.
   * 2. Calcula el stock ANTES de la compra (para el costo promedio ponderado).
   * 3. Crea la compra, sus líneas y un movimiento `ENTRADA` por línea.
   * 4. Actualiza el costo del producto con el promedio ponderado.
   */
  async crear(dto: CrearCompraDto): Promise<CompraDetalleSalida> {
    this.validarSinDuplicados(dto.items);

    // Valida el proveedor fuera de la transacción (solo existe un chequeo de FK).
    const proveedor = await this.prisma.proveedor.findFirst({
      where: { id: dto.proveedorId, eliminadoEn: null },
      select: { id: true },
    });
    if (!proveedor) throw new BadRequestException('El proveedor no existe.');

    const productoIds = [...new Set(dto.items.map((item) => item.productoId))];

    return this.prisma.$transaction(async (tx) => {
      // El bloqueo debe ser lo primero: evita que una venta concurrente lea stock a medias.
      await bloquearProductos(tx, productoIds);

      const productos = await tx.producto.findMany({
        where: { id: { in: productoIds }, eliminadoEn: null },
        select: { id: true, nombre: true, costo: true },
      });
      const porId = new Map(productos.map((producto) => [producto.id, producto]));
      for (const item of dto.items) {
        if (!porId.has(item.productoId)) {
          throw new NotFoundException('Uno de los productos no existe.');
        }
      }

      // Stock previo a esta compra: necesario para el promedio ponderado.
      const stockAntes = await stockPorProducto(tx, productoIds);
      const compradoEn = dto.compradoEn ? new Date(dto.compradoEn) : new Date();

      // Calcula los totales con `Prisma.Decimal` (nunca con float) para evitar redondeos.
      let total = new Prisma.Decimal(0);
      const lineas = dto.items.map((item) => {
        const costoUnitario = new Prisma.Decimal(item.costoUnitario);
        const totalLinea = costoUnitario.mul(item.cantidad);
        total = total.add(totalLinea);
        return { item, costoUnitario, totalLinea };
      });

      const compra = await tx.compra.create({
        data: {
          proveedorId: dto.proveedorId,
          total,
          compradoEn,
          detalles: {
            create: lineas.map((linea) => ({
              productoId: linea.item.productoId,
              cantidad: linea.item.cantidad,
              costoUnitario: linea.costoUnitario,
              totalLinea: linea.totalLinea,
            })),
          },
        },
        include: INCLUDE_COMPRA_DETALLE,
      });

      for (const linea of lineas) {
        // El movimiento ENTRADA es lo que hace que el stock derivado aumente.
        await tx.movimientoInventario.create({
          data: {
            productoId: linea.item.productoId,
            tipo: 'ENTRADA',
            cantidad: linea.item.cantidad,
            costoUnitario: linea.costoUnitario,
            tipoReferencia: 'compra',
            referenciaId: compra.id,
            ocurridoEn: compradoEn,
          },
        });

        // Costo promedio ponderado:
        // (stock_anterior × costo_actual + cantidad × costo_nuevo) / nuevo_stock.
        // Con stock previo 0 el resultado es simplemente el costo unitario ingresado.
        const producto = porId.get(linea.item.productoId)!;
        const stockAnterior = stockAntes.get(linea.item.productoId) ?? 0;
        const nuevoStock = stockAnterior + linea.item.cantidad;
        const costoPromedio = producto.costo
          .mul(stockAnterior)
          .add(linea.costoUnitario.mul(linea.item.cantidad))
          .div(nuevoStock);

        await tx.producto.update({
          where: { id: linea.item.productoId },
          data: { costo: costoPromedio.toDecimalPlaces(2) },
        });
      }

      return this.toSalidaDetalle(compra);
    });
  }

  private validarSinDuplicados(items: Array<{ productoId: number }>) {
    const ids = items.map((item) => item.productoId);
    if (new Set(ids).size !== ids.length) {
      throw new BadRequestException('Hay productos repetidos en las líneas de la compra.');
    }
  }

  private toSalida(compra: CompraLista): CompraSalida {
    return {
      id: compra.id,
      proveedor: compra.proveedor,
      total: compra.total.toFixed(2),
      compradoEn: compra.compradoEn,
      creadoEn: compra.creadoEn,
      items: compra._count.detalles,
    };
  }

  private toSalidaDetalle(compra: CompraDetalle): CompraDetalleSalida {
    return {
      id: compra.id,
      proveedor: compra.proveedor,
      total: compra.total.toFixed(2),
      compradoEn: compra.compradoEn,
      creadoEn: compra.creadoEn,
      items: compra.detalles.map((detalle) => ({
        id: detalle.id,
        productoId: detalle.productoId,
        sku: detalle.producto.sku,
        producto: detalle.producto.nombre,
        cantidad: detalle.cantidad,
        costoUnitario: detalle.costoUnitario.toFixed(2),
        totalLinea: detalle.totalLinea.toFixed(2),
      })),
    };
  }
}
