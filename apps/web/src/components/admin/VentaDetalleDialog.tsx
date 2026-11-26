import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { obtenerVenta } from '@/lib/api';
import { formatearCOP } from '@/lib/dinero';

interface Props {
  abierto: boolean;
  onAbiertoChange: (abierto: boolean) => void;
  ventaId: number | null;
}

export function VentaDetalleDialog({ abierto, onAbiertoChange, ventaId }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['venta', ventaId],
    queryFn: () => obtenerVenta(ventaId!),
    enabled: abierto && ventaId !== null,
  });

  const venta = data?.data;

  return (
    <Dialog open={abierto} onOpenChange={onAbiertoChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogTitle>Venta #{ventaId ?? ''}</DialogTitle>
        <DialogDescription>
          {venta
            ? `${venta.cliente.nombre} ${venta.cliente.apellido ?? ''} · ${new Date(venta.emitidaEn).toLocaleDateString('es-CO')}`
            : 'Detalle de la venta.'}
        </DialogDescription>

        {isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, indice) => (
              <Skeleton key={indice} className="h-8 w-full" />
            ))}
          </div>
        )}

        {!isLoading && venta && (
          <>
            <div className="flex items-center gap-2">
              <Badge variant="entry">{venta.estado}</Badge>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border/60">
              <table className="w-full min-w-[520px] text-left text-[12px]">
                <thead className="border-b border-border/60 bg-secondary/40 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Producto</th>
                    <th className="px-3 py-2 text-right font-medium">Cantidad</th>
                    <th className="px-3 py-2 text-right font-medium">Precio unit.</th>
                    <th className="px-3 py-2 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {venta.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2">
                        <span className="font-medium">{item.producto}</span>
                        <span className="num block text-[11px] text-muted-foreground">{item.sku}</span>
                      </td>
                      <td className="num px-3 py-2 text-right">{item.cantidad}</td>
                      <td className="num px-3 py-2 text-right">{formatearCOP(item.precioUnitario)}</td>
                      <td className="num px-3 py-2 text-right font-medium">
                        {formatearCOP(item.totalLinea)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-1 rounded-md border border-border/60 bg-secondary/40 px-3 py-2 text-[12px]">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="num">{formatearCOP(venta.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Impuesto</span>
                <span className="num">{formatearCOP(venta.impuesto)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="num">{formatearCOP(venta.total)}</span>
              </div>
            </div>

            {venta.notas && (
              <p className="rounded-sm border border-border/60 px-3 py-2 text-[12px] text-muted-foreground">
                {venta.notas}
              </p>
            )}
          </>
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
