import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { History, Search, SlidersHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { AjusteInventarioDialog } from '@/components/admin/AjusteInventarioDialog';
import { KardexDialog } from '@/components/admin/KardexDialog';
import { listarInventario } from '@/lib/api';
import { formatearCOP } from '@/lib/dinero';
import type { InventarioItem } from '@/lib/types';

const POR_PAGINA = 10;

export function AdminInventarioPage() {
  const queryClient = useQueryClient();

  const [buscar, setBuscar] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);

  const [kardexAbierto, setKardexAbierto] = useState(false);
  const [productoKardex, setProductoKardex] = useState<InventarioItem | null>(null);
  const [ajusteAbierto, setAjusteAbierto] = useState(false);
  const [productoAjuste, setProductoAjuste] = useState<InventarioItem | null>(null);

  const filtros = { buscar: busqueda || undefined, pagina, porPagina: POR_PAGINA };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['inventario', filtros],
    queryFn: () => listarInventario(filtros),
  });

  const items = data?.data ?? [];
  const meta = data?.meta;

  function refrescar() {
    void queryClient.invalidateQueries({ queryKey: ['inventario'] });
    void queryClient.invalidateQueries({ queryKey: ['productos', 'opciones'] });
  }

  function abrirKardex(producto: InventarioItem) {
    setProductoKardex(producto);
    setKardexAbierto(true);
  }

  function abrirAjuste(producto: InventarioItem) {
    setProductoAjuste(producto);
    setAjusteAbierto(true);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div>
        <p className="eyebrow">Operación</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tightest">Inventario</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Stock derivado del kardex. Las compras suman y las ventas restan.
        </p>
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
              placeholder="Nombre, SKU o categoría"
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
          <table className="w-full min-w-[820px] text-left text-[12px]">
            <thead className="border-b border-border/60 bg-secondary/40 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-3 py-2.5 font-medium">Producto</th>
                <th className="px-3 py-2.5 font-medium">Categoría</th>
                <th className="px-3 py-2.5 text-right font-medium">Stock</th>
                <th className="px-3 py-2.5 text-right font-medium">Mínimo</th>
                <th className="px-3 py-2.5 text-right font-medium">Costo</th>
                <th className="px-3 py-2.5 text-right font-medium">Precio</th>
                <th className="px-3 py-2.5 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading &&
                Array.from({ length: 5 }).map((_, indice) => (
                  <tr key={indice}>
                    <td colSpan={7} className="px-3 py-3">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))}

              {!isLoading &&
                items.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-secondary/30">
                    <td className="px-3 py-2.5">
                      <span className="font-medium">{item.nombre}</span>
                      <span className="num block text-[11px] text-muted-foreground">{item.sku}</span>
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{item.categoria}</td>
                    <td className="px-3 py-2.5 text-right">
                      {item.bajoMinimo ? (
                        <Badge variant="warning">{item.stock}</Badge>
                      ) : (
                        <span className="num font-medium">{item.stock}</span>
                      )}
                    </td>
                    <td className="num px-3 py-2.5 text-right text-muted-foreground">
                      {item.stockMinimo}
                    </td>
                    <td className="num px-3 py-2.5 text-right text-muted-foreground">
                      {formatearCOP(item.costo)}
                    </td>
                    <td className="num px-3 py-2.5 text-right">{formatearCOP(item.precio)}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Ver kardex de ${item.nombre}`}
                          onClick={() => abrirKardex(item)}
                        >
                          <History className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Ajustar ${item.nombre}`}
                          onClick={() => abrirAjuste(item)}
                        >
                          <SlidersHorizontal className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {!isLoading && items.length === 0 && (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-muted-foreground">
              {isError
                ? 'No fue posible cargar el inventario.'
                : 'No hay productos que coincidan con la búsqueda.'}
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
            {meta.total} producto{meta.total === 1 ? '' : 's'} · página {meta.pagina} de{' '}
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

      <KardexDialog
        abierto={kardexAbierto}
        onAbiertoChange={setKardexAbierto}
        producto={productoKardex}
      />
      <AjusteInventarioDialog
        abierto={ajusteAbierto}
        onAbiertoChange={setAjusteAbierto}
        producto={productoAjuste}
        onGuardado={refrescar}
      />
    </div>
  );
}
