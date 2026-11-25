import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ProveedorFormDialog } from '@/components/admin/ProveedorFormDialog';
import { ApiError, eliminarProveedor, listarProveedores } from '@/lib/api';
import type { Proveedor } from '@/lib/types';

const POR_PAGINA = 10;

export function AdminProveedoresPage() {
  const queryClient = useQueryClient();

  const [buscar, setBuscar] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);

  const [formAbierto, setFormAbierto] = useState(false);
  const [proveedorEditando, setProveedorEditando] = useState<Proveedor | null>(null);

  const [accionError, setAccionError] = useState<string | null>(null);
  const [procesandoId, setProcesandoId] = useState<number | null>(null);

  const filtros = { buscar: busqueda || undefined, pagina, porPagina: POR_PAGINA };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['proveedores', filtros],
    queryFn: () => listarProveedores(filtros),
  });

  const proveedores = data?.data ?? [];
  const meta = data?.meta;

  function refrescar() {
    void queryClient.invalidateQueries({ queryKey: ['proveedores'] });
    void queryClient.invalidateQueries({ queryKey: ['proveedores', 'opciones'] });
  }

  function abrirNuevo() {
    setProveedorEditando(null);
    setFormAbierto(true);
  }

  function abrirEdicion(proveedor: Proveedor) {
    setProveedorEditando(proveedor);
    setFormAbierto(true);
  }

  async function eliminar(proveedor: Proveedor) {
    const confirmado = window.confirm(`¿Eliminar el proveedor "${proveedor.nombre}"?`);
    if (!confirmado) return;

    setAccionError(null);
    setProcesandoId(proveedor.id);
    try {
      await eliminarProveedor(proveedor.id);
      refrescar();
    } catch (err) {
      setAccionError(
        err instanceof ApiError ? err.message : 'No fue posible eliminar el proveedor.',
      );
    } finally {
      setProcesandoId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Abastecimiento</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tightest">Proveedores</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Fabricantes y distribuidores que abastecen el catálogo.
          </p>
        </div>
        <Button onClick={abrirNuevo} size="sm">
          <Plus className="size-4" />
          Nuevo proveedor
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
              placeholder="Nombre, NIT, ciudad o correo"
              className="h-9 pl-8"
            />
          </div>
        </div>
        <Button type="submit" variant="outline" size="sm">
          Buscar
        </Button>
      </form>

      {accionError && (
        <p className="mt-3 rounded-sm border border-destructive/25 bg-destructive/10 px-3 py-2 text-[12px] text-destructive">
          {accionError}
        </p>
      )}

      <div className="mt-4 overflow-hidden rounded-lg border border-border/60 bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-[12px]">
            <thead className="border-b border-border/60 bg-secondary/40 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-3 py-2.5 font-medium">NIT</th>
                <th className="px-3 py-2.5 font-medium">Proveedor</th>
                <th className="px-3 py-2.5 font-medium">Contacto</th>
                <th className="px-3 py-2.5 text-center font-medium">Productos</th>
                <th className="px-3 py-2.5 text-center font-medium">Compras</th>
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
                proveedores.map((proveedor) => (
                  <tr key={proveedor.id} className="transition-colors hover:bg-secondary/30">
                    <td className="num px-3 py-2.5 whitespace-nowrap text-muted-foreground">
                      {proveedor.nit}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="font-medium">{proveedor.nombre}</span>
                      <span className="block text-[11px] text-muted-foreground">
                        {proveedor.ciudad} · {proveedor.direccion}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="block">{proveedor.correo}</span>
                      <span className="num block text-[11px] text-muted-foreground">
                        {proveedor.telefono}
                      </span>
                    </td>
                    <td className="num px-3 py-2.5 text-center">{proveedor.productos}</td>
                    <td className="num px-3 py-2.5 text-center">{proveedor.compras}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        {procesandoId === proveedor.id && (
                          <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Editar ${proveedor.nombre}`}
                          onClick={() => abrirEdicion(proveedor)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Eliminar ${proveedor.nombre}`}
                          onClick={() => eliminar(proveedor)}
                        >
                          <Trash2 className="size-3.5 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {!isLoading && proveedores.length === 0 && (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-muted-foreground">
              {isError
                ? 'No fue posible cargar los proveedores.'
                : 'No hay proveedores que coincidan con la búsqueda.'}
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
            {meta.total} proveedor{meta.total === 1 ? '' : 'es'} · página {meta.pagina} de{' '}
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

      <ProveedorFormDialog
        abierto={formAbierto}
        onAbiertoChange={setFormAbierto}
        proveedor={proveedorEditando}
        onGuardado={refrescar}
      />
    </div>
  );
}
