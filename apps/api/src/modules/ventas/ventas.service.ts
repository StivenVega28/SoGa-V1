import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { bloquearProductos, stockPorProducto } from '../../common/stock.util';
import { CrearVentaDto, ListarVentasQuery } from './dto/venta.dto';

const INCLUDE_VENTA = {
  cliente: { select: { id: true, nombre: true, apellido: true } },
  _count: { select: { items: true } },
} satisfies Prisma.VentaInclude;

type VentaLista = Prisma.VentaGetPayload<{ include: typeof INCLUDE_VENTA }>;

const INCLUDE_VENTA_DETALLE = {
  cliente: { select: { id: true, nombre: true, apellido: true } },
  items: {
    include: { producto: { select: { id: true, sku: true, nombre: true } } },
    orderBy: { id: 'asc' as const },
  },
} satisfies Prisma.VentaInclude;

type VentaDetalle = Prisma.VentaGetPayload<{ include: typeof INCLUDE_VENTA_DETALLE }>;

export interface VentaSalida {
  id: number;
  cliente: { id: number; nombre: string; apellido: string | null };
  emitidaEn: Date;
  subtotal: string;
  impuesto: string;
  total: string;
  estado: string;
  items: number;
}

export interface VentaDetalleSalida extends Omit<VentaSalida, 'items'> {
  notas: string | null;
  items: Array<{
    id: number;
    productoId: number;
    sku: string;
    producto: string;
    cantidad: number;
    precioUnitario: string;
    totalLinea: string;
  }>;
}

@Injectable()
export class VentasService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(query: ListarVentasQuery) {
    const pagina = query.pagina ?? 1;
    const porPagina = query.porPagina ?? 20;
    const buscar = query.buscar?.trim();

    const where: Prisma.VentaWhereInput = {
      ...(query.clienteId ? { clienteId: query.clienteId } : {}),
      ...(query.estado ? { estado: query.estado } : {}),
      ...(buscar
        ? { cliente: { OR: [{ nombre: { contains: buscar } }, { apellido: { contains: buscar } }] } }
        : {}),
    };

    const [total, filas] = await this.prisma.$transaction([
      this.prisma.venta.count({ where }),
      this.prisma.venta.findMany({
        where,
        include: INCLUDE_VENTA,
        orderBy: [{ emitidaEn: 'desc' }, { id: 'desc' }],
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

  async obtener(id: number): Promise<VentaDetalleSalida> {
    const venta = await this.prisma.venta.findUnique({
      where: { id },
      include: INCLUDE_VENTA_DETALLE,
    });
    if (!venta) throw new NotFoundException('Venta no encontrada.');
    return this.toSalidaDetalle(venta);
  }

  /**
   * Registra una venta (cabecera + detalle) y descuenta el inventario.
   *
   * Flujo en una sola transacción para evitar sobreventa:
   * 1. Bloquea las filas de producto (`FOR UPDATE`): cualquier otra venta o compra
   *    concurrente del mismo producto queda serializada.
   * 2. Valida que todos los productos existan y estén activos.
   * 3. Calcula el stock derivado y rechaza con `409` si no alcanza por línea.
   * 4. Crea la venta (estado `CONFIRMADA`), sus detalles y un movimiento `SALIDA` por línea.
   */
  async crear(dto: CrearVentaDto): Promise<VentaDetalleSalida> {
    this.validarSinDuplicados(dto.items);

    const cliente = await this.prisma.cliente.findFirst({
      where: { id: dto.clienteId, eliminadoEn: null },
      select: { id: true },
    });
    if (!cliente) throw new BadRequestException('El cliente no existe.');

    const productoIds = [...new Set(dto.items.map((item) => item.productoId))];

    return this.prisma.$transaction(async (tx) => {
      // Bloqueo primero: la lectura de stock posterior verá un estado consistente.
      await bloquearProductos(tx, productoIds);

      const productos = await tx.producto.findMany({
        where: { id: { in: productoIds }, eliminadoEn: null },
        select: { id: true, nombre: true, precio: true, costo: true, activo: true },
      });
      const porId = new Map(productos.map((producto) => [producto.id, producto]));
      for (const item of dto.items) {
        const producto = porId.get(item.productoId);
        if (!producto) throw new NotFoundException('Uno de los productos no existe.');
        if (!producto.activo) {
          throw new BadRequestException(`El producto "${producto.nombre}" está inactivo.`);
        }
      }

      // Regla de negocio clave: no se puede vender más de lo que hay en inventario.
      const stock = await stockPorProducto(tx, productoIds);
      for (const item of dto.items) {
        const disponible = stock.get(item.productoId) ?? 0;
        if (disponible < item.cantidad) {
          const producto = porId.get(item.productoId)!;
          throw new ConflictException(
            `Stock insuficiente para "${producto.nombre}" (disponible: ${disponible}).`,
          );
        }
      }

      const emitidaEn = dto.emitidaEn ? new Date(dto.emitidaEn) : new Date();
      let subtotal = new Prisma.Decimal(0);
      const lineas = dto.items.map((item) => {
        const producto = porId.get(item.productoId)!;
        // Si la línea no trae precio, se usa el precio de venta del producto.
        const precioUnitario = item.precioUnitario
          ? new Prisma.Decimal(item.precioUnitario)
          : producto.precio;
        const totalLinea = precioUnitario.mul(item.cantidad);
        subtotal = subtotal.add(totalLinea);
        return { item, producto, precioUnitario, totalLinea };
      });

      const total = subtotal; // impuesto en 0 por ahora.

      const venta = await tx.venta.create({
        data: {
          clienteId: dto.clienteId,
          emitidaEn,
          subtotal,
          impuesto: new Prisma.Decimal(0),
          total,
          estado: 'CONFIRMADA',
          notas: dto.notas?.trim() || null,
          items: {
            create: lineas.map((linea) => ({
              productoId: linea.item.productoId,
              cantidad: linea.item.cantidad,
              precioUnitario: linea.precioUnitario,
              totalLinea: linea.totalLinea,
            })),
          },
        },
        include: INCLUDE_VENTA_DETALLE,
      });

      for (const linea of lineas) {
        // La SALIDA descuenta el stock derivado. Se guarda el costo actual del producto
        // como `costoUnitario` para poder calcular el costo de venta (COGS) después.
        await tx.movimientoInventario.create({
          data: {
            productoId: linea.item.productoId,
            tipo: 'SALIDA',
            cantidad: linea.item.cantidad,
            costoUnitario: linea.producto.costo,
            tipoReferencia: 'venta',
            referenciaId: venta.id,
            ocurridoEn: emitidaEn,
          },
        });
      }

      return this.toSalidaDetalle(venta);
    });
  }

  private validarSinDuplicados(items: Array<{ productoId: number }>) {
    const ids = items.map((item) => item.productoId);
    if (new Set(ids).size !== ids.length) {
      throw new BadRequestException('Hay productos repetidos en las líneas de la venta.');
    }
  }

  private toSalida(venta: VentaLista): VentaSalida {
    return {
      id: venta.id,
      cliente: venta.cliente,
      emitidaEn: venta.emitidaEn,
      subtotal: venta.subtotal.toFixed(2),
      impuesto: venta.impuesto.toFixed(2),
      total: venta.total.toFixed(2),
      estado: venta.estado,
      items: venta._count.items,
    };
  }

  private toSalidaDetalle(venta: VentaDetalle): VentaDetalleSalida {
    return {
      id: venta.id,
      cliente: venta.cliente,
      emitidaEn: venta.emitidaEn,
      subtotal: venta.subtotal.toFixed(2),
      impuesto: venta.impuesto.toFixed(2),
      total: venta.total.toFixed(2),
      estado: venta.estado,
      notas: venta.notas,
      items: venta.items.map((item) => ({
        id: item.id,
        productoId: item.productoId,
        sku: item.producto.sku,
        producto: item.producto.nombre,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario.toFixed(2),
        totalLinea: item.totalLinea.toFixed(2),
      })),
    };
  }
}
