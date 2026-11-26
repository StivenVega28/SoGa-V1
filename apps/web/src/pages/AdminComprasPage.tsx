import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { CompraDetalleDialog } from '@/components/admin/CompraDetalleDialog';
import { CompraFormDialog } from '@/components/admin/CompraFormDialog';
import { listarCompras } from '@/lib/api';
import { formatearCOP } from '@/lib/dinero';

const POR_PAGINA = 10;

export function AdminComprasPage() {
  const queryClient = useQueryClient();

  const [buscar, setBuscar] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);

  const [formAbierto, setFormAbierto] = useState(false);
  const [detalleAbierto, setDetalleAbierto] = useState(false);
  const [detalleId, setDetalleId] = useState<number | null>(null);

  const filtros = { buscar: busqueda || undefined, pagina, porPagina: POR_PAGINA };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['compras', filtros],
    queryFn: () => listarCompras(filtros),
  });

  const compras = data?.data ?? [];
  const meta = data?.meta;

  function refrescar() {
    void queryClient.invalidateQueries({ queryKey: ['compras'] });
    void queryClient.invalidateQueries({ queryKey: ['inventario'] });
  }

  function verDetalle(id: number) {
    setDetalleId(id);
    setDetalleAbierto(true);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Abastecimiento</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tightest">Compras</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Entradas de mercancía que suman al inventario.
          </p>
        </div>
        <Button onClick={() => setFormAbierto(true)} size="sm">
          <Plus className="size-4" />
          Nueva compra
        </Button>
      </div>

      <form
        className="mt-5 flex flex-wrap items-end gap-2 rounded-lg border border-border/60 bg-card p-3"
        onSubmit={(event) => {
          event.preventDefault();
          setPagina(1);
          setBusqueda(buscar.trim());
        }}
      >
        <div className="min-w-[260px] flex-1 space-y-1">
          <label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Buscar
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
              placeholder="Buscar por proveedor"
              maxLength={100}
              className="h-9 pl-8"
            />
          </div>
        </div>
        <Button type="submit" variant="outline" size="sm">
          Buscar
        </Button>
      </form>

      <div className="mt-4 overflow-hidden rounded-lg border border-border/60 bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-[12px]">
            <thead className="border-b border-border/60 bg-secondary/40 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-3 py-2.5 font-medium">#</th>
                <th className="px-3 py-2.5 font-medium">Fecha</th>
                <th className="px-3 py-2.5 font-medium">Proveedor</th>
                <th className="px-3 py-2.5 text-center font-medium">Ítems</th>
                <th className="px-3 py-2.5 text-right font-medium">Total</th>
                <th className="px-3 py-2.5 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading &&
                Array.from({ length: 5 }).map((_, indice) => (
                  <tr key={indice}>
                    <td colSpan={6} className="px-3 py-3">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))}

              {!isLoading &&
                compras.map((compra) => (
                  <tr key={compra.id} className="transition-colors hover:bg-secondary/30">
                    <td className="num px-3 py-2.5 text-muted-foreground">#{compra.id}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {new Date(compra.compradoEn).toLocaleDateString('es-CO')}
                    </td>
                    <td className="px-3 py-2.5 font-medium">{compra.proveedor.nombre}</td>
                    <td className="num px-3 py-2.5 text-center">{compra.items}</td>
                    <td className="num px-3 py-2.5 text-right font-medium">
                      {formatearCOP(compra.total)}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Ver compra ${compra.id}`}
                          onClick={() => verDetalle(compra.id)}
                        >
                          <Eye className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {!isLoading && compras.length === 0 && (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-muted-foreground">
              {isError
                ? 'No fue posible cargar las compras.'
                : 'No hay compras registradas.'}
            </p>
            {isError && (
              <Button variant="outline" size="sm" className="mt-4" onClick={() => void refetch()}>
                Reintentar
              </Button>
            )}
          </div>
        )}
      </div>

      {meta && meta.total > 0 && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <span className="num">
            {meta.total} compra{meta.total === 1 ? '' : 's'} · página {meta.pagina} de{' '}
            {meta.paginas}
          </span>
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.pagina <= 1}
              onClick={() => setPagina((valor) => Math.max(1, valor - 1))}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={meta.pagina >= meta.paginas}
              onClick={() => setPagina((valor) => Math.min(meta.paginas, valor + 1))}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      <CompraFormDialog
        abierto={formAbierto}
        onAbiertoChange={setFormAbierto}
        onGuardado={refrescar}
      />
      <CompraDetalleDialog
        abierto={detalleAbierto}
        onAbiertoChange={setDetalleAbierto}
        compraId={detalleId}
      />
    </div>
  );
}
