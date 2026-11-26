import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ClienteFormDialog } from '@/components/admin/ClienteFormDialog';
import { ApiError, eliminarCliente, listarClientes } from '@/lib/api';
import type { Cliente } from '@/lib/types';

const POR_PAGINA = 10;

export function AdminClientesPage() {
  const queryClient = useQueryClient();

  const [buscar, setBuscar] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);

  const [formAbierto, setFormAbierto] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);

  const [accionError, setAccionError] = useState<string | null>(null);
  const [procesandoId, setProcesandoId] = useState<number | null>(null);

  const filtros = { buscar: busqueda || undefined, pagina, porPagina: POR_PAGINA };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['clientes', filtros],
    queryFn: () => listarClientes(filtros),
  });

  const clientes = data?.data ?? [];
  const meta = data?.meta;

  function refrescar() {
    void queryClient.invalidateQueries({ queryKey: ['clientes'] });
    void queryClient.invalidateQueries({ queryKey: ['clientes', 'opciones'] });
  }

  function abrirNuevo() {
    setClienteEditando(null);
    setFormAbierto(true);
  }

  function abrirEdicion(cliente: Cliente) {
    setClienteEditando(cliente);
    setFormAbierto(true);
  }

  async function eliminar(cliente: Cliente) {
    const confirmado = window.confirm(`¿Eliminar el cliente "${cliente.nombre}"?`);
    if (!confirmado) return;

    setAccionError(null);
    setProcesandoId(cliente.id);
    try {
      await eliminarCliente(cliente.id);
      refrescar();
    } catch (err) {
      setAccionError(
        err instanceof ApiError ? err.message : 'No fue posible eliminar el cliente.',
      );
    } finally {
      setProcesandoId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Comercial</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tightest">Clientes</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Cartera de clientes para ventas y cotizaciones.
          </p>
        </div>
        <Button onClick={abrirNuevo} size="sm">
          <Plus className="size-4" />
          Nuevo cliente
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
              maxLength={100}
              className="h-9 pl-8"
            />
          </div>
        </div>
        <Button type="submit" variant="outline" size="sm">
          Buscar
        </Button>
      </form>

      {accionError && (
        <p
          role="alert"
          aria-live="polite"
          className="mt-3 rounded-sm border border-destructive/25 bg-destructive/10 px-3 py-2 text-[12px] text-destructive"
        >
          {accionError}
        </p>
      )}

      <div className="mt-4 overflow-hidden rounded-lg border border-border/60 bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-[12px]">
            <thead className="border-b border-border/60 bg-secondary/40 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-3 py-2.5 font-medium">NIT</th>
                <th className="px-3 py-2.5 font-medium">Cliente</th>
                <th className="px-3 py-2.5 font-medium">Contacto</th>
                <th className="px-3 py-2.5 text-center font-medium">Ventas</th>
                <th className="px-3 py-2.5 text-center font-medium">Cotizaciones</th>
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
                clientes.map((cliente) => (
                  <tr key={cliente.id} className="transition-colors hover:bg-secondary/30">
                    <td className="num px-3 py-2.5 whitespace-nowrap text-muted-foreground">
                      {cliente.nit}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="font-medium">
                        {cliente.nombre} {cliente.apellido ?? ''}
                      </span>
                      <span className="block text-[11px] text-muted-foreground">
                        {cliente.ciudad}
                        {cliente.sucursal ? ` · ${cliente.sucursal}` : ''}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="block">{cliente.correo}</span>
                      <span className="num block text-[11px] text-muted-foreground">
                        {cliente.telefono}
                      </span>
                    </td>
                    <td className="num px-3 py-2.5 text-center">{cliente.ventas}</td>
                    <td className="num px-3 py-2.5 text-center">{cliente.cotizaciones}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        {procesandoId === cliente.id && (
                          <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Editar ${cliente.nombre}`}
                          onClick={() => abrirEdicion(cliente)}
                          disabled={procesandoId !== null}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Eliminar ${cliente.nombre}`}
                          onClick={() => eliminar(cliente)}
                          disabled={procesandoId !== null}
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

        {!isLoading && clientes.length === 0 && (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-muted-foreground">
              {isError
                ? 'No fue posible cargar los clientes.'
                : 'No hay clientes que coincidan con la búsqueda.'}
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
            {meta.total} cliente{meta.total === 1 ? '' : 's'} · página {meta.pagina} de{' '}
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

      <ClienteFormDialog
        abierto={formAbierto}
        onAbiertoChange={setFormAbierto}
        cliente={clienteEditando}
        onGuardado={refrescar}
      />
    </div>
  );
}
