import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Pencil, Plus, Power, Search, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductoFormDialog } from '@/components/admin/ProductoFormDialog';
import {
  ApiError,
  cambiarEstadoProducto,
  eliminarProducto,
  listarCategorias,
  listarProductos,
  listarProveedores,
} from '@/lib/api';
import { formatearCOP } from '@/lib/dinero';
import type { ProductoAdmin } from '@/lib/types';

const POR_PAGINA = 10;

export function AdminProductosPage() {
  const queryClient = useQueryClient();

  const [buscar, setBuscar] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [activo, setActivo] = useState('');
  const [pagina, setPagina] = useState(1);

  const [formAbierto, setFormAbierto] = useState(false);
  const [productoEditando, setProductoEditando] = useState<ProductoAdmin | null>(null);

  const [accionError, setAccionError] = useState<string | null>(null);
  const [procesandoId, setProcesandoId] = useState<number | null>(null);

  const filtros = {
    buscar: busqueda || undefined,
    categoriaId: categoriaId ? Number(categoriaId) : undefined,
    activo: (activo || undefined) as 'true' | 'false' | undefined,
    pagina,
    porPagina: POR_PAGINA,
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['productos', filtros],
    queryFn: () => listarProductos(filtros),
  });

  const { data: categorias } = useQuery({
    queryKey: ['categorias'],
    queryFn: listarCategorias,
  });

  const { data: proveedores } = useQuery({
    queryKey: ['proveedores', 'opciones'],
    queryFn: () => listarProveedores({ porPagina: 100 }),
  });

  const productos = data?.data ?? [];
  const meta = data?.meta;

  function refrescar() {
    void queryClient.invalidateQueries({ queryKey: ['productos'] });
    void queryClient.invalidateQueries({ queryKey: ['categorias'] });
  }

  function abrirNuevo() {
    setProductoEditando(null);
    setFormAbierto(true);
  }

  function abrirEdicion(producto: ProductoAdmin) {
    setProductoEditando(producto);
    setFormAbierto(true);
  }

  async function alternarEstado(producto: ProductoAdmin) {
    setAccionError(null);
    setProcesandoId(producto.id);
    try {
      await cambiarEstadoProducto(producto.id, !producto.activo);
      refrescar();
    } catch (err) {
      setAccionError(err instanceof ApiError ? err.message : 'No fue posible cambiar el estado.');
    } finally {
      setProcesandoId(null);
    }
  }

  async function eliminar(producto: ProductoAdmin) {
    const confirmado = window.confirm(
      `¿Eliminar "${producto.nombre}"? Si tiene movimientos, solo se podrá inactivar.`,
    );
    if (!confirmado) return;

    setAccionError(null);
    setProcesandoId(producto.id);
    try {
      await eliminarProducto(producto.id);
      refrescar();
    } catch (err) {
      setAccionError(err instanceof ApiError ? err.message : 'No fue posible eliminar el producto.');
    } finally {
      setProcesandoId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Catálogo</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tightest">Productos</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Referencias, precios, costos y variantes del catálogo.
          </p>
        </div>
        <Button onClick={abrirNuevo} size="sm">
          <Plus className="size-4" />
          Nuevo producto
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
        <div className="min-w-[220px] flex-1 space-y-1">
          <label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Buscar
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
              placeholder="Nombre o SKU"
              className="h-9 pl-8"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Categoría
          </label>
          <select
            value={categoriaId}
            onChange={(e) => {
              setCategoriaId(e.target.value);
              setPagina(1);
            }}
            className="h-9 rounded-md border border-input bg-background px-2 text-[12px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Todas</option>
            {categorias?.data.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Estado
          </label>
          <select
            value={activo}
            onChange={(e) => {
              setActivo(e.target.value);
              setPagina(1);
            }}
            className="h-9 rounded-md border border-input bg-background px-2 text-[12px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
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
          <table className="w-full min-w-[860px] text-left text-[12px]">
            <thead className="border-b border-border/60 bg-secondary/40 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-3 py-2.5 font-medium">SKU</th>
                <th className="px-3 py-2.5 font-medium">Producto</th>
                <th className="px-3 py-2.5 text-right font-medium">Precio</th>
                <th className="px-3 py-2.5 text-right font-medium">Costo</th>
                <th className="px-3 py-2.5 text-center font-medium">Stock mín.</th>
                <th className="px-3 py-2.5 text-center font-medium">Var.</th>
                <th className="px-3 py-2.5 font-medium">Estado</th>
                <th className="px-3 py-2.5 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading &&
                Array.from({ length: 6 }).map((_, indice) => (
                  <tr key={indice}>
                    <td colSpan={8} className="px-3 py-3">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))}

              {!isLoading &&
                productos.map((producto) => (
                  <tr key={producto.id} className="transition-colors hover:bg-secondary/30">
                    <td className="num px-3 py-2.5 whitespace-nowrap text-muted-foreground">
                      {producto.sku}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{producto.nombre}</span>
                        {producto.destacado && <Badge variant="entry">Destacado</Badge>}
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {producto.categoria.nombre}
                        {producto.proveedor ? ` · ${producto.proveedor.nombre}` : ''}
                      </span>
                    </td>
                    <td className="num px-3 py-2.5 whitespace-nowrap text-right">
                      {formatearCOP(producto.precio)}
                    </td>
                    <td className="num px-3 py-2.5 whitespace-nowrap text-right text-muted-foreground">
                      {formatearCOP(producto.costo)}
                    </td>
                    <td className="num px-3 py-2.5 text-center">{producto.stockMinimo}</td>
                    <td className="num px-3 py-2.5 text-center">{producto.variantes.length}</td>
                    <td className="px-3 py-2.5">
                      <Badge variant={producto.activo ? 'entry' : 'neutral'}>
                        {producto.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        {procesandoId === producto.id && (
                          <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Editar ${producto.nombre}`}
                          onClick={() => abrirEdicion(producto)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={
                            producto.activo
                              ? `Inactivar ${producto.nombre}`
                              : `Activar ${producto.nombre}`
                          }
                          onClick={() => alternarEstado(producto)}
                        >
                          <Power className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Eliminar ${producto.nombre}`}
                          onClick={() => eliminar(producto)}
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

        {!isLoading && productos.length === 0 && (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-muted-foreground">
              {isError
                ? 'No fue posible cargar los productos.'
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

      <ProductoFormDialog
        abierto={formAbierto}
        onAbiertoChange={setFormAbierto}
        producto={productoEditando}
        categorias={categorias?.data ?? []}
        proveedores={proveedores?.data ?? []}
        onGuardado={refrescar}
      />
    </div>
  );
}
