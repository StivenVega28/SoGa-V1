import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { obtenerCompra } from '@/lib/api';
import { formatearCOP } from '@/lib/dinero';

interface Props {
  abierto: boolean;
  onAbiertoChange: (abierto: boolean) => void;
  compraId: number | null;
}

export function CompraDetalleDialog({ abierto, onAbiertoChange, compraId }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['compra', compraId],
    queryFn: () => obtenerCompra(compraId!),
    enabled: abierto && compraId !== null,
  });

  const compra = data?.data;

  return (
    <Dialog open={abierto} onOpenChange={onAbiertoChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogTitle>Compra #{compraId ?? ''}</DialogTitle>
        <DialogDescription>
          {compra
            ? `${compra.proveedor.nombre} · ${new Date(compra.compradoEn).toLocaleDateString('es-CO')}`
            : 'Detalle de la compra.'}
        </DialogDescription>

        {isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, indice) => (
              <Skeleton key={indice} className="h-8 w-full" />
            ))}
          </div>
        )}

        {!isLoading && compra && (
          <>
            <div className="overflow-x-auto rounded-lg border border-border/60">
              <table className="w-full min-w-[520px] text-left text-[12px]">
                <thead className="border-b border-border/60 bg-secondary/40 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Producto</th>
                    <th className="px-3 py-2 text-right font-medium">Cantidad</th>
                    <th className="px-3 py-2 text-right font-medium">Costo unit.</th>
                    <th className="px-3 py-2 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {compra.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2">
                        <span className="font-medium">{item.producto}</span>
                        <span className="num block text-[11px] text-muted-foreground">{item.sku}</span>
                      </td>
                      <td className="num px-3 py-2 text-right">{item.cantidad}</td>
                      <td className="num px-3 py-2 text-right">{formatearCOP(item.costoUnitario)}</td>
                      <td className="num px-3 py-2 text-right font-medium">
                        {formatearCOP(item.totalLinea)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between rounded-md border border-border/60 bg-secondary/40 px-3 py-2">
              <span className="text-[12px] text-muted-foreground">Total</span>
              <span className="num text-sm font-semibold">{formatearCOP(compra.total)}</span>
            </div>
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
