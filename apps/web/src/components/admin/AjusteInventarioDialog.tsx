import { useEffect, useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ajustarInventario, ApiError } from '@/lib/api';
import type { InventarioItem } from '@/lib/types';

interface Props {
  abierto: boolean;
  onAbiertoChange: (abierto: boolean) => void;
  producto: InventarioItem | null;
  onGuardado: () => void;
}

export function AjusteInventarioDialog({ abierto, onAbiertoChange, producto, onGuardado }: Props) {
  const [cantidad, setCantidad] = useState('');
  const [nota, setNota] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!abierto) return;
    setCantidad('');
    setNota('');
    setError(null);
  }, [abierto]);

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const numero = parseInt(cantidad, 10);
    if (!Number.isInteger(numero) || numero === 0) {
      setError('La cantidad debe ser un número entero distinto de cero.');
      return;
    }
    if (!producto) return;

    setGuardando(true);
    try {
      await ajustarInventario({
        productoId: producto.id,
        cantidad: numero,
        nota: nota.trim() || undefined,
      });
      onGuardado();
      onAbiertoChange(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No fue posible ajustar el inventario.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Dialog open={abierto} onOpenChange={onAbiertoChange}>
      <DialogContent className="max-w-md">
        <DialogTitle>Ajustar inventario</DialogTitle>
        <DialogDescription>
          {producto
            ? `${producto.nombre} — stock actual: ${producto.stock}.`
            : ''}{' '}
          Usa una cantidad positiva para sumar o negativa para restar.
        </DialogDescription>

        <form onSubmit={guardar} className="mt-2 space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="ajuste-cantidad">Cantidad *</Label>
            <Input
              id="ajuste-cantidad"
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              placeholder="Ej: 5 o -3"
              autoComplete="off"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ajuste-nota">Nota</Label>
            <Textarea
              id="ajuste-nota"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Motivo del ajuste (opcional)"
              maxLength={255}
            />
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
              Guardar ajuste
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
