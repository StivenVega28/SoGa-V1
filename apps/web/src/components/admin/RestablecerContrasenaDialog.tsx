import { useEffect, useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiError, restablecerContrasena } from '@/lib/api';
import type { Usuario } from '@/lib/types';

interface Props {
  abierto: boolean;
  onAbiertoChange: (abierto: boolean) => void;
  usuario: Usuario | null;
  onGuardado: () => void;
}

export function RestablecerContrasenaDialog({
  abierto,
  onAbiertoChange,
  usuario,
  onGuardado,
}: Props) {
  const [contrasena, setContrasena] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!abierto) return;
    setContrasena('');
    setConfirmar('');
    setError(null);
  }, [abierto]);

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!usuario) return;
    if (contrasena.length < 10) {
      setError('La contraseña debe tener al menos 10 caracteres.');
      return;
    }
    if (contrasena !== confirmar) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setGuardando(true);
    try {
      await restablecerContrasena(usuario.id, contrasena);
      onGuardado();
      onAbiertoChange(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No fue posible cambiar la contraseña.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Dialog open={abierto} onOpenChange={onAbiertoChange}>
      <DialogContent className="max-w-md">
        <DialogTitle>Restablecer contraseña</DialogTitle>
        <DialogDescription>
          La contraseña de {usuario?.nombre ?? 'este usuario'} será reemplazada y su sesión actual
          quedará cerrada.
        </DialogDescription>

        <form onSubmit={guardar} className="mt-2 space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="reset-contrasena">Nueva contraseña *</Label>
            <Input
              id="reset-contrasena"
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="Mínimo 10 caracteres"
              maxLength={128}
              autoComplete="new-password"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reset-confirmar">Confirmar contraseña *</Label>
            <Input
              id="reset-confirmar"
              type="password"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              placeholder="Repite la contraseña"
              maxLength={128}
              autoComplete="new-password"
              required
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
              Restablecer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
