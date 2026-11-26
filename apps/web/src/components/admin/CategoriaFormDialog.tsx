import { useEffect, useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ApiError, crearCategoria } from '@/lib/api';

interface Props {
  abierto: boolean;
  onAbiertoChange: (abierto: boolean) => void;
  onGuardado: () => void;
}

export function CategoriaFormDialog({ abierto, onAbiertoChange, onGuardado }: Props) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!abierto) return;
    setNombre('');
    setDescripcion('');
    setError(null);
  }, [abierto]);

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (nombre.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres.');
      return;
    }

    setGuardando(true);
    try {
      await crearCategoria({
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
      });
      onGuardado();
      onAbiertoChange(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No fue posible crear la categoría.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Dialog open={abierto} onOpenChange={onAbiertoChange}>
      <DialogContent className="max-w-md">
        <DialogTitle>Nueva categoría</DialogTitle>
        <DialogDescription>
          Las categorías agrupan los productos del catálogo.
        </DialogDescription>

        <form onSubmit={guardar} className="mt-2 space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="categoria-nombre">Nombre *</Label>
            <Input
              id="categoria-nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Escritorios"
              maxLength={100}
              autoComplete="off"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="categoria-descripcion">Descripción</Label>
            <Textarea
              id="categoria-descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Qué incluye esta categoría (opcional)"
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
              Crear categoría
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
