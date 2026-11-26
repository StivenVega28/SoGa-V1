import { Prisma } from '@prisma/client';

/**
 * Calcula el stock derivado del kardex para un conjunto de productos.
 * ENTRADA suma, SALIDA resta y AJUSTE se aplica con su propio signo
 * (un ajuste negativo reduce el stock).
 */
export async function stockPorProducto(
  tx: Prisma.TransactionClient,
  productoIds: number[],
): Promise<Map<number, number>> {
  if (productoIds.length === 0) return new Map();

  const movimientos = await tx.movimientoInventario.groupBy({
    by: ['productoId', 'tipo'],
    where: { productoId: { in: productoIds } },
    _sum: { cantidad: true },
  });

  const stock = new Map<number, number>();
  for (const fila of movimientos) {
    const previo = stock.get(fila.productoId) ?? 0;
    const cantidad = fila._sum.cantidad ?? 0;
    stock.set(fila.productoId, fila.tipo === 'SALIDA' ? previo - cantidad : previo + cantidad);
  }
  return stock;
}

/**
 * Bloquea las filas de producto (`SELECT ... FOR UPDATE`) para serializar
 * los movimientos de inventario y evitar sobreventa bajo concurrencia.
 * Debe invocarse como primera operación dentro de la transacción.
 */
export async function bloquearProductos(
  tx: Prisma.TransactionClient,
  productoIds: number[],
): Promise<void> {
  if (productoIds.length === 0) return;
  await tx.$queryRaw`SELECT id FROM productos WHERE id IN (${Prisma.join(productoIds)}) FOR UPDATE`;
}
