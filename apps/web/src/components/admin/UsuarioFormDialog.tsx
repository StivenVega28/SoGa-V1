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
import { actualizarUsuario, ApiError, crearUsuario } from '@/lib/api';
import type { Rol, Usuario, UsuarioPayload } from '@/lib/types';

interface Props {
  abierto: boolean;
  onAbiertoChange: (abierto: boolean) => void;
  usuario: Usuario | null;
  roles: Rol[];
  esPropio: boolean;
  onGuardado: () => void;
}

interface Formulario {
  nombre: string;
  apellido: string;
  documento: string;
  telefono: string;
  correo: string;
  rolId: string;
  contrasena: string;
  confirmar: string;
}

const VACIO: Formulario = {
  nombre: '',
  apellido: '',
  documento: '',
  telefono: '',
  correo: '',
  rolId: '',
  contrasena: '',
  confirmar: '',
};

const CLASE_SELECT =
  'h-9 w-full rounded-md border border-input bg-background px-2 text-[12px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60';

export function UsuarioFormDialog({
  abierto,
  onAbiertoChange,
  usuario,
  roles,
  esPropio,
  onGuardado,
}: Props) {
  const [form, setForm] = useState<Formulario>(VACIO);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!abierto) return;

    setForm(
      usuario
        ? {
            nombre: usuario.nombre,
            apellido: usuario.apellido ?? '',
            documento: usuario.documento ?? '',
            telefono: usuario.telefono ?? '',
            correo: usuario.correo,
            rolId: usuario.rolId ? String(usuario.rolId) : '',
            contrasena: '',
            confirmar: '',
          }
        : { ...VACIO, rolId: roles.length === 1 ? String(roles[0].id) : '' },
    );
    setError(null);
  }, [abierto, usuario, roles]);

  function actualizar<K extends keyof Formulario>(campo: K, valor: Formulario[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (form.nombre.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo.trim())) {
      setError('El correo no tiene un formato válido.');
      return;
    }
    if (!form.rolId) {
      setError('Selecciona un rol.');
      return;
    }

    if (!usuario) {
      if (form.contrasena.length < 10) {
        setError('La contraseña debe tener al menos 10 caracteres.');
        return;
      }
      if (form.contrasena !== form.confirmar) {
        setError('Las contraseñas no coinciden.');
        return;
      }
    }

    const base = {
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim() || null,
      documento: form.documento.trim() || null,
      telefono: form.telefono.trim() || null,
      correo: form.correo.trim().toLowerCase(),
      rolId: Number(form.rolId),
    };

    setGuardando(true);
    try {
      if (usuario) {
        await actualizarUsuario(usuario.id, base);
      } else {
        const payload: UsuarioPayload = { ...base, contrasena: form.contrasena };
        await crearUsuario(payload);
      }
      onGuardado();
      onAbiertoChange(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No fue posible guardar el usuario.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Dialog open={abierto} onOpenChange={onAbiertoChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogTitle>{usuario ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
        <DialogDescription>
          {usuario
            ? 'El correo y el documento son únicos. El cambio de contraseña se hace por separado.'
            : 'Se creará una cuenta de acceso con la contraseña indicada.'}
        </DialogDescription>

        <form onSubmit={guardar} className="mt-2 space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="usuario-nombre">Nombre *</Label>
              <Input
                id="usuario-nombre"
                value={form.nombre}
                onChange={(e) => actualizar('nombre', e.target.value)}
                placeholder="María"
                maxLength={150}
                autoComplete="given-name"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="usuario-apellido">Apellido</Label>
              <Input
                id="usuario-apellido"
                value={form.apellido}
                onChange={(e) => actualizar('apellido', e.target.value)}
                placeholder="Rodríguez"
                maxLength={100}
                autoComplete="family-name"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="usuario-documento">Documento</Label>
              <Input
                id="usuario-documento"
                value={form.documento}
                onChange={(e) => actualizar('documento', e.target.value)}
                placeholder="1030111222"
                maxLength={20}
                autoComplete="off"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="usuario-telefono">Teléfono</Label>
              <Input
                id="usuario-telefono"
                value={form.telefono}
                onChange={(e) => actualizar('telefono', e.target.value)}
                placeholder="300 123 4567"
                maxLength={20}
                autoComplete="tel"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="usuario-correo">Correo *</Label>
            <Input
              id="usuario-correo"
              type="email"
              value={form.correo}
              onChange={(e) => actualizar('correo', e.target.value)}
              placeholder="usuario@soga.com"
              maxLength={150}
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="usuario-rol">Rol *</Label>
            <select
              id="usuario-rol"
              className={CLASE_SELECT}
              value={form.rolId}
              onChange={(e) => actualizar('rolId', e.target.value)}
              disabled={esPropio}
              required
            >
              <option value="">Selecciona un rol</option>
              {roles.map((rol) => (
                <option key={rol.id} value={rol.id}>
                  {rol.nombre}
                </option>
              ))}
            </select>
            {esPropio && (
              <p className="text-[11px] text-muted-foreground">
                No puedes cambiar tu propio rol.
              </p>
            )}
          </div>

          {!usuario && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="usuario-contrasena">Contraseña *</Label>
                <Input
                  id="usuario-contrasena"
                  type="password"
                  value={form.contrasena}
                  onChange={(e) => actualizar('contrasena', e.target.value)}
                  placeholder="Mínimo 10 caracteres"
                  maxLength={128}
                  autoComplete="new-password"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="usuario-confirmar">Confirmar contraseña *</Label>
                <Input
                  id="usuario-confirmar"
                  type="password"
                  value={form.confirmar}
                  onChange={(e) => actualizar('confirmar', e.target.value)}
                  placeholder="Repite la contraseña"
                  maxLength={128}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>
          )}

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
              {usuario ? 'Guardar cambios' : 'Crear usuario'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
