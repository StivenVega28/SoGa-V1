import { useEffect, useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { actualizarRol, ApiError, crearRol } from '@/lib/api';
import { PERMISOS_DISPONIBLES } from '@/lib/permisos';
import type { Rol, RolPayload } from '@/lib/types';

interface Props {
  abierto: boolean;
  onAbiertoChange: (abierto: boolean) => void;
  rol: Rol | null;
  onGuardado: () => void;
}

export function RolFormDialog({ abierto, onAbiertoChange, rol, onGuardado }: Props) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [permisos, setPermisos] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const esTodos = permisos.includes('todos');

  useEffect(() => {
    if (!abierto) return;
    if (rol) {
      setNombre(rol.nombre);
      setDescripcion(rol.descripcion);
      setPermisos(rol.permisos ? rol.permisos.split(',').map((p) => p.trim()) : []);
    } else {
      setNombre('');
      setDescripcion('');
      setPermisos([]);
    }
    setError(null);
  }, [abierto, rol]);

  function alternarTodos(activo: boolean) {
    setPermisos(activo ? ['todos'] : []);
  }

  function alternarPermiso(valor: string, activo: boolean) {
    setPermisos((prev) => {
      const sinTodos = prev.filter((p) => p !== 'todos');
      return activo ? [...sinTodos, valor] : sinTodos.filter((p) => p !== valor);
    });
  }

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (nombre.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres.');
      return;
    }
    if (permisos.length === 0) {
      setError('Selecciona al menos un permiso o activa el acceso total.');
      return;
    }

    const payload: RolPayload = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || undefined,
      permisos,
    };

    setGuardando(true);
    try {
      if (rol) {
        await actualizarRol(rol.id, payload);
      } else {
        await crearRol(payload);
      }
      onGuardado();
      onAbiertoChange(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No fue posible guardar el rol.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Dialog open={abierto} onOpenChange={onAbiertoChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogTitle>{rol ? 'Editar rol' : 'Nuevo rol'}</DialogTitle>
        <DialogDescription>
          Define los módulos a los que puede acceder el rol. El acceso de lectura se valida por
          permisos; las mutaciones siguen reservadas para Administrador (o Vendedor en ventas y
          clientes).
        </DialogDescription>

        <form onSubmit={guardar} className="mt-2 space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="rol-nombre">Nombre *</Label>
            <Input
              id="rol-nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Supervisor"
              maxLength={100}
              autoComplete="off"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rol-descripcion">Descripción</Label>
            <Textarea
              id="rol-descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Qué hace este rol"
              maxLength={255}
            />
          </div>

          <div className="space-y-2 rounded-md border border-border/60 p-3">
            <label className="flex items-center gap-2 text-[12px] font-medium">
              <input
                type="checkbox"
                checked={esTodos}
                onChange={(e) => alternarTodos(e.target.checked)}
                className="size-4 accent-[hsl(var(--primary))]"
              />
              Acceso total (todos los módulos)
            </label>

            {!esTodos && (
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {PERMISOS_DISPONIBLES.map((permiso) => (
                  <label key={permiso.valor} className="flex items-center gap-2 text-[12px]">
                    <input
                      type="checkbox"
                      checked={permisos.includes(permiso.valor)}
                      onChange={(e) => alternarPermiso(permiso.valor, e.target.checked)}
                      className="size-4 accent-[hsl(var(--primary))]"
                    />
                    {permiso.etiqueta}
                  </label>
                ))}
              </div>
            )}
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
              {rol ? 'Guardar cambios' : 'Crear rol'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
