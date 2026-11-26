import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { kardexInventario } from '@/lib/api';
import { formatearCOP } from '@/lib/dinero';
import type { InventarioItem, MovimientoInventario } from '@/lib/types';

interface Props {
  abierto: boolean;
  onAbiertoChange: (abierto: boolean) => void;
  producto: InventarioItem | null;
}

const ETIQUETA_TIPO: Record<MovimientoInventario['tipo'], string> = {
  ENTRADA: 'Entrada',
  SALIDA: 'Salida',
  AJUSTE: 'Ajuste',
  ANULACION: 'Anulación',
};

const VARIANTE_TIPO: Record<MovimientoInventario['tipo'], 'entry' | 'danger' | 'warning' | 'neutral'> = {
  ENTRADA: 'entry',
  SALIDA: 'danger',
  AJUSTE: 'warning',
  ANULACION: 'neutral',
};

function cantidadConSigno(movimiento: MovimientoInventario): string {
  if (movimiento.tipo === 'SALIDA') return `-${movimiento.cantidad}`;
  if (movimiento.tipo === 'AJUSTE' && movimiento.cantidad < 0) return `${movimiento.cantidad}`;
  return `+${movimiento.cantidad}`;
}

export function KardexDialog({ abierto, onAbiertoChange, producto }: Props) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['kardex', producto?.id],
    queryFn: () => kardexInventario(producto!.id),
    enabled: abierto && producto !== null,
  });

  const movimientos = data?.data.movimientos ?? [];

  return (
    <Dialog open={abierto} onOpenChange={onAbiertoChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogTitle>Kardex de inventario</DialogTitle>
        <DialogDescription>
          {producto ? `${producto.sku} · ${producto.nombre}` : ''} — movimientos de entrada y salida.
        </DialogDescription>

        {isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, indice) => (
              <Skeleton key={indice} className="h-8 w-full" />
            ))}
          </div>
        )}

        {!isLoading && isError && (
          <div className="rounded-sm border border-destructive/25 bg-destructive/10 px-3 py-8 text-center text-[13px] text-destructive">
            No fue posible cargar los movimientos.
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => void refetch()}
            >
              Reintentar
            </Button>
          </div>
        )}

        {!isLoading && !isError && (
          <div className="overflow-x-auto rounded-lg border border-border/60">
            <table className="w-full min-w-[560px] text-left text-[12px]">
              <thead className="border-b border-border/60 bg-secondary/40 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Fecha</th>
                  <th className="px-3 py-2 font-medium">Tipo</th>
                  <th className="px-3 py-2 text-right font-medium">Cantidad</th>
                  <th className="px-3 py-2 text-right font-medium">Costo unit.</th>
                  <th className="px-3 py-2 font-medium">Referencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {movimientos.map((movimiento) => (
                  <tr key={movimiento.id} className="transition-colors hover:bg-secondary/30">
                    <td className="px-3 py-2 text-muted-foreground">
                      {new Date(movimiento.ocurridoEn).toLocaleString('es-CO')}
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant={VARIANTE_TIPO[movimiento.tipo]}>
                        {ETIQUETA_TIPO[movimiento.tipo]}
                      </Badge>
                    </td>
                    <td className="num px-3 py-2 text-right font-medium">
                      {cantidadConSigno(movimiento)}
                    </td>
                    <td className="num px-3 py-2 text-right text-muted-foreground">
                      {movimiento.costoUnitario ? formatearCOP(movimiento.costoUnitario) : '—'}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {movimiento.tipoReferencia
                        ? `${movimiento.tipoReferencia}${movimiento.referenciaId ? ` #${movimiento.referenciaId}` : ''}`
                        : movimiento.nota ?? '—'}
                    </td>
                  </tr>
                ))}
                {movimientos.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                      Sin movimientos registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-end">
          <Button type="button" variant="outline" onClick={() => onAbiertoChange(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
