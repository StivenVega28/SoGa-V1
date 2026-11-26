import { useEffect, useState } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { actualizarProducto, ApiError, crearProducto } from '@/lib/api';
import type {
  Categoria,
  ProductoAdmin,
  ProductoPayload,
  Proveedor,
  VariantePayload,
} from '@/lib/types';

interface Props {
  abierto: boolean;
  onAbiertoChange: (abierto: boolean) => void;
  producto: ProductoAdmin | null;
  categorias: Categoria[];
  proveedores: Proveedor[];
  onGuardado: () => void;
}

interface Formulario {
  sku: string;
  nombre: string;
  descripcion: string;
  precio: string;
  costo: string;
  categoriaId: string;
  proveedorId: string;
  unidad: string;
  stockMinimo: string;
  imagen: string;
  galeria: string;
  destacado: boolean;
  activo: boolean;
}

const VACIO: Formulario = {
  sku: '',
  nombre: '',
  descripcion: '',
  precio: '',
  costo: '',
  categoriaId: '',
  proveedorId: '',
  unidad: 'UNIDAD',
  stockMinimo: '0',
  imagen: '',
  galeria: '',
  destacado: false,
  activo: true,
};

interface VarianteForm {
  id?: number;
  nombre: string;
  sku: string;
  precio: string;
  activo: boolean;
}

export function ProductoFormDialog({
  abierto,
  onAbiertoChange,
  producto,
  categorias,
  proveedores,
  onGuardado,
}: Props) {
  const [form, setForm] = useState<Formulario>(VACIO);
  const [variantes, setVariantes] = useState<VarianteForm[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!abierto) return;

    if (producto) {
      setForm({
        sku: producto.sku,
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: producto.precio,
        costo: producto.costo,
        categoriaId: String(producto.categoria.id),
        proveedorId: producto.proveedor ? String(producto.proveedor.id) : '',
        unidad: producto.unidad,
        stockMinimo: String(producto.stockMinimo),
        imagen: producto.imagen ?? '',
        galeria: producto.imagenes.join('\n'),
        destacado: producto.destacado,
        activo: producto.activo,
      });
      setVariantes(
        producto.variantes.map((variante) => ({
          id: variante.id,
          nombre: variante.nombre,
          sku: variante.sku,
          precio: variante.precio ?? '',
          activo: variante.activo,
        })),
      );
    } else {
      setForm({ ...VACIO, categoriaId: categorias[0] ? String(categorias[0].id) : '' });
      setVariantes([]);
    }

    setError(null);
  }, [abierto, producto, categorias]);

  function actualizar<K extends keyof Formulario>(campo: K, valor: Formulario[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  function actualizarVariante(indice: number, cambios: Partial<VarianteForm>) {
    setVariantes((prev) =>
      prev.map((variante, i) => (i === indice ? { ...variante, ...cambios } : variante)),
    );
  }

  function agregarVariante() {
    setVariantes((prev) => [
      ...prev,
      { nombre: '', sku: form.sku ? `${form.sku}-` : '', precio: '', activo: true },
    ]);
  }

  async function guardar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!form.sku.trim() || !form.nombre.trim() || !form.descripcion.trim()) {
      setError('SKU, nombre y descripción son obligatorios.');
      return;
    }
    if (!/^\d{1,10}(\.\d{1,2})?$/.test(form.precio)) {
      setError('El precio debe ser un número con hasta 2 decimales.');
      return;
    }
    if (form.costo && !/^\d{1,10}(\.\d{1,2})?$/.test(form.costo)) {
      setError('El costo debe ser un número con hasta 2 decimales.');
      return;
    }
    if (!form.categoriaId) {
      setError('Selecciona una categoría.');
      return;
    }
    if (variantes.some((variante) => !variante.nombre.trim() || !variante.sku.trim())) {
      setError('Cada variante necesita nombre y SKU.');
      return;
    }

    const galeria = form.galeria
      .split('\n')
      .map((linea) => linea.trim())
      .filter(Boolean);

    const payload: ProductoPayload = {
      sku: form.sku.trim().toUpperCase(),
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      precio: form.precio,
      costo: form.costo || undefined,
      categoriaId: Number(form.categoriaId),
      proveedorId: form.proveedorId ? Number(form.proveedorId) : null,
      unidad: form.unidad.trim() || 'UNIDAD',
      stockMinimo: Number(form.stockMinimo) || 0,
      imagen: form.imagen.trim() || undefined,
      imagenes: galeria,
      destacado: form.destacado,
      activo: form.activo,
      variantes: variantes.map<VariantePayload>((variante) => ({
        id: variante.id,
        nombre: variante.nombre.trim(),
        sku: variante.sku.trim().toUpperCase(),
        precio: variante.precio || undefined,
        activo: variante.activo,
      })),
    };

    setGuardando(true);
    try {
      if (producto) {
        await actualizarProducto(producto.id, payload);
      } else {
        await crearProducto(payload);
      }
      onGuardado();
      onAbiertoChange(false);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'No fue posible guardar el producto.',
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Dialog open={abierto} onOpenChange={onAbiertoChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogTitle>{producto ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
        <DialogDescription>
          Los precios y costos se guardan con dos decimales. El SKU debe ser único.
        </DialogDescription>

        <form onSubmit={guardar} className="mt-2 space-y-5" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={form.sku}
                onChange={(e) => actualizar('sku', e.target.value.toUpperCase())}
                placeholder="SILLA-NAIROBI-PRES"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="categoria">Categoría *</Label>
              <select
                id="categoria"
                value={form.categoriaId}
                onChange={(e) => actualizar('categoriaId', e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              >
                <option value="">Selecciona…</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="proveedor">Proveedor</Label>
            <select
              id="proveedor"
              value={form.proveedorId}
              onChange={(e) => actualizar('proveedorId', e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Sin proveedor</option>
              {proveedores.map((proveedor) => (
                <option key={proveedor.id} value={proveedor.id}>
                  {proveedor.nombre} · {proveedor.nit}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              value={form.nombre}
              onChange={(e) => actualizar('nombre', e.target.value)}
              placeholder="Silla NAIROBI modelo presidente"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="descripcion">Descripción *</Label>
            <Textarea
              id="descripcion"
              value={form.descripcion}
              onChange={(e) => actualizar('descripcion', e.target.value)}
              placeholder="Materiales, mecanismo, garantía…"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="precio">Precio venta *</Label>
              <Input
                id="precio"
                inputMode="decimal"
                value={form.precio}
                onChange={(e) => actualizar('precio', e.target.value)}
                placeholder="1299000.00"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="costo">Costo</Label>
              <Input
                id="costo"
                inputMode="decimal"
                value={form.costo}
                onChange={(e) => actualizar('costo', e.target.value)}
                placeholder="820000.00"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="unidad">Unidad</Label>
              <Input
                id="unidad"
                value={form.unidad}
                onChange={(e) => actualizar('unidad', e.target.value.toUpperCase())}
                placeholder="UNIDAD"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stockMinimo">Stock mínimo</Label>
              <Input
                id="stockMinimo"
                type="number"
                min={0}
                value={form.stockMinimo}
                onChange={(e) => actualizar('stockMinimo', e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="imagen">Imagen principal</Label>
              <Input
                id="imagen"
                value={form.imagen}
                onChange={(e) => actualizar('imagen', e.target.value)}
                placeholder="/img/products/silla-...-1.png"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="galeria">Galería (una URL por línea)</Label>
              <Textarea
                id="galeria"
                value={form.galeria}
                onChange={(e) => actualizar('galeria', e.target.value)}
                placeholder={'/img/products/silla-...-1.png\n/img/products/silla-...-2.png'}
                className="min-h-[38px]"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-5">
            <label className="flex items-center gap-2 text-[12px]">
              <input
                type="checkbox"
                checked={form.activo}
                onChange={(e) => actualizar('activo', e.target.checked)}
                className="size-4 accent-[hsl(var(--primary))]"
              />
              Activo en el catálogo
            </label>
            <label className="flex items-center gap-2 text-[12px]">
              <input
                type="checkbox"
                checked={form.destacado}
                onChange={(e) => actualizar('destacado', e.target.checked)}
                className="size-4 accent-[hsl(var(--primary))]"
              />
              Producto destacado
            </label>
          </div>

          <div className="rounded-lg border border-border/60">
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold">Variantes</span>
                <Badge variant="neutral">{variantes.length}</Badge>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={agregarVariante}>
                <Plus className="size-3.5" />
                Agregar
              </Button>
            </div>

            <div className="space-y-2 p-3">
              {variantes.length === 0 && (
                <p className="px-1 py-2 text-[12px] text-muted-foreground">
                  Sin variantes. Agrega al menos una (por ejemplo, color o tapizado).
                </p>
              )}

              {variantes.map((variante, indice) => (
                <div
                  key={`${variante.id ?? 'nueva'}-${indice}`}
                  className="grid items-end gap-2 rounded-md border border-border/50 bg-secondary/20 p-2 sm:grid-cols-[1.2fr_1fr_0.8fr_auto_auto]"
                >
                  <div className="space-y-1">
                    <Label className="text-[10px]">Nombre</Label>
                    <Input
                      value={variante.nombre}
                      onChange={(e) => actualizarVariante(indice, { nombre: e.target.value })}
                      placeholder="Negro"
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">SKU</Label>
                    <Input
                      value={variante.sku}
                      onChange={(e) =>
                        actualizarVariante(indice, { sku: e.target.value.toUpperCase() })
                      }
                      placeholder="SILLA-...-NEG"
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">Precio</Label>
                    <Input
                      value={variante.precio}
                      onChange={(e) => actualizarVariante(indice, { precio: e.target.value })}
                      placeholder="Opcional"
                      className="h-8"
                    />
                  </div>
                  <label className="flex h-8 items-center gap-2 text-[11px]">
                    <input
                      type="checkbox"
                      checked={variante.activo}
                      onChange={(e) => actualizarVariante(indice, { activo: e.target.checked })}
                      className="size-4 accent-[hsl(var(--primary))]"
                    />
                    Activa
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Quitar variante"
                    disabled={Boolean(variante.id)}
                    title={variante.id ? 'Las variantes guardadas se desactivan, no se eliminan' : 'Quitar'}
                    onClick={() => setVariantes((prev) => prev.filter((_, i) => i !== indice))}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <p className="rounded-sm border border-destructive/25 bg-destructive/10 px-3 py-2 text-[12px] text-destructive">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onAbiertoChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={guardando}>
              {guardando && <Loader2 className="size-4 animate-spin" />}
              {producto ? 'Guardar cambios' : 'Crear producto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
