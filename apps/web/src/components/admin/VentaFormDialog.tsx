import { useEffect, useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiError, crearVenta, listarClientes, listarInventario } from '@/lib/api';
import { formatearCOP, totalLineas } from '@/lib/dinero';
import type { InventarioItem } from '@/lib/types';

interface Props {
  abierto: boolean;
  onAbiertoChange: (abierto: boolean) => void;
  onGuardado: () => void;
}

interface Linea {
  productoId: string;
  cantidad: string;
  precioUnitario: string;
}

const LINEA_VACIA: Linea = { productoId: '', cantidad: '', precioUnitario: '' };

const CLASE_SELECT =
  'h-9 w-full rounded-md border border-input bg-background px-2 text-[12px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60';

export function VentaFormDialog({ abierto, onAbiertoChange, onGuardado }: Props) {
  const [clienteId, setClienteId] = useState('');
  const [items, setItems] = useState<Linea[]>([{ ...LINEA_VACIA }]);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const { data: clientesData } = useQuery({
    queryKey: ['clientes', 'opciones'],
    queryFn: () => listarClientes({ porPagina: 100 }),
    enabled: abierto,
  });
  const { data: inventarioData } = useQuery({
    queryKey: ['inventario', 'opciones'],
    queryFn: () => listarInventario({ porPagina: 100 }),
    enabled: abierto,
  });

  const clientes = clientesData?.data ?? [];
  const inventario = inventarioData?.data ?? [];

  useEffect(() => {
    if (!abierto) return;
    setClienteId('');
    setItems([{ ...LINEA_VACIA }]);
    setError(null);
  }, [abierto]);

  function actualizarLinea(indice: number, campo: keyof Linea, valor: string) {
    setItems((prev) =>
      prev.map((linea, i) => (i === indice ? { ...linea, [campo]: valor } : linea)),
    );
  }

  function alSeleccionarProducto(indice: number, productoId: string, inventarioLista: InventarioItem[]) {
    const producto = inventarioLista.find((item) => String(item.id) === productoId);
    setItems((prev) =>
      prev.map((linea, i) => {
        if (i !== indice) return linea;
        return {
          ...linea,
          productoId,
          precioUnitario: linea.precioUnitario || (producto ? producto.precio : ''),
        };
      }),
    );
  }

  function agregarLinea() {
    setItems((prev) => [...prev, { ...LINEA_VACIA }]);
  }

  function quitarLinea(indice: number) {
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== indice)));
  }

  const total = totalLineas(items.map((linea) => ({ cantidad: linea.cantidad, monto: linea.precioUnitario })));

  function stockDe(productoId: string): number {
    return inventario.find((item) => String(item.id) === productoId)?.stock ?? 0;
  }

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!clienteId) {
      setError('Selecciona un cliente.');
      return;
    }
    const lineasValidas = items.filter((linea) => linea.productoId || linea.cantidad || linea.precioUnitario);
    if (lineasValidas.length === 0) {
      setError('Agrega al menos una línea de producto.');
      return;
    }
    for (const linea of lineasValidas) {
      if (!linea.productoId) {
        setError('Cada línea debe tener un producto seleccionado.');
        return;
      }
      const cantidad = parseInt(linea.cantidad, 10);
      if (!Number.isInteger(cantidad) || cantidad <= 0) {
        setError('La cantidad de cada línea debe ser un entero mayor a cero.');
        return;
      }
      // Validación de stock en el cliente solo como ayuda visual: el backend la
      // vuelve a validar con bloqueo de fila y es la fuente de verdad.
      if (cantidad > stockDe(linea.productoId)) {
        const producto = inventario.find((item) => String(item.id) === linea.productoId);
        setError(`No hay stock suficiente para "${producto?.nombre ?? 'el producto'}" (disponible: ${stockDe(linea.productoId)}).`);
        return;
      }
      if (!/^\d{1,10}(\.\d{1,2})?$/.test(linea.precioUnitario)) {
        setError('El precio unitario debe ser un decimal válido.');
        return;
      }
    }

    setGuardando(true);
    try {
      await crearVenta({
        clienteId: Number(clienteId),
        items: lineasValidas.map((linea) => ({
          productoId: Number(linea.productoId),
          cantidad: parseInt(linea.cantidad, 10),
          precioUnitario: linea.precioUnitario,
        })),
      });
      onGuardado();
      onAbiertoChange(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No fue posible guardar la venta.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Dialog open={abierto} onOpenChange={onAbiertoChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogTitle>Nueva venta</DialogTitle>
        <DialogDescription>
          Al guardar se descuenta el stock de cada producto vendido.
        </DialogDescription>

        <form onSubmit={guardar} className="mt-2 space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="venta-cliente">Cliente *</Label>
            <select
              id="venta-cliente"
              className={CLASE_SELECT}
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              required
            >
              <option value="">Selecciona un cliente</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre} {cliente.apellido ?? ''}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                Líneas de producto
              </span>
              <Button type="button" variant="outline" size="sm" onClick={agregarLinea}>
                <Plus className="size-3.5" />
                Agregar línea
              </Button>
            </div>

            {items.map((linea, indice) => {
              const disponible = stockDe(linea.productoId);
              return (
                <div
                  key={indice}
                  className="grid grid-cols-1 items-end gap-2 rounded-md border border-border/60 p-2 sm:grid-cols-[1fr_90px_130px_auto]"
                >
                  <div className="space-y-1">
                    <Label className="text-[11px]">Producto</Label>
                    <select
                      className={CLASE_SELECT}
                      value={linea.productoId}
                      onChange={(e) => alSeleccionarProducto(indice, e.target.value, inventario)}
                    >
                      <option value="">Selecciona…</option>
                      {inventario.map((producto) => (
                        <option key={producto.id} value={producto.id}>
                          {producto.sku} · {producto.nombre} ({producto.stock} disp.)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px]">Cantidad</Label>
                    <Input
                      type="number"
                      min={1}
                      max={linea.productoId ? disponible : undefined}
                      value={linea.cantidad}
                      onChange={(e) => actualizarLinea(indice, 'cantidad', e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px]">Precio unitario</Label>
                    <Input
                      inputMode="decimal"
                      value={linea.precioUnitario}
                      onChange={(e) => actualizarLinea(indice, 'precioUnitario', e.target.value)}
                      placeholder="0.00"
                      className="h-9"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Quitar línea"
                    onClick={() => quitarLinea(indice)}
                    disabled={items.length === 1}
                    className="size-9"
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between rounded-md border border-border/60 bg-secondary/40 px-3 py-2">
            <span className="text-[12px] text-muted-foreground">Total</span>
            <span className="num text-sm font-semibold">{formatearCOP(total)}</span>
          </div>

          {error && (
            <p
              role="alert"
              aria-live="polite"
              className="rounded-sm border border-destructive/25 bg-destructive/10 px-3 py-2 text-[12px] text-destructive"
            >
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onAbiertoChange(false)}
              disabled={guardando}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={guardando}>
              {guardando && <Loader2 className="size-4 animate-spin" />}
              Registrar venta
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
