import { useEffect, useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { actualizarProveedor, ApiError, crearProveedor } from '@/lib/api';
import type { Proveedor, ProveedorPayload } from '@/lib/types';

interface Props {
  abierto: boolean;
  onAbiertoChange: (abierto: boolean) => void;
  proveedor: Proveedor | null;
  onGuardado: () => void;
}

interface Formulario {
  nit: string;
  nombre: string;
  ciudad: string;
  direccion: string;
  telefono: string;
  correo: string;
  descripcion: string;
}

const VACIO: Formulario = {
  nit: '',
  nombre: '',
  ciudad: '',
  direccion: '',
  telefono: '',
  correo: '',
  descripcion: '',
};

export function ProveedorFormDialog({ abierto, onAbiertoChange, proveedor, onGuardado }: Props) {
  const [form, setForm] = useState<Formulario>(VACIO);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!abierto) return;

    setForm(
      proveedor
        ? {
            nit: proveedor.nit,
            nombre: proveedor.nombre,
            ciudad: proveedor.ciudad,
            direccion: proveedor.direccion,
            telefono: proveedor.telefono,
            correo: proveedor.correo,
            descripcion: proveedor.descripcion ?? '',
          }
        : VACIO,
    );
    setError(null);
  }, [abierto, proveedor]);

  function actualizar<K extends keyof Formulario>(campo: K, valor: Formulario[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function guardar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!form.nit.trim() || !form.nombre.trim() || !form.ciudad.trim()) {
      setError('NIT, nombre y ciudad son obligatorios.');
      return;
    }
    if (!form.direccion.trim() || !form.telefono.trim() || !form.correo.trim()) {
      setError('Dirección, teléfono y correo son obligatorios.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo.trim())) {
      setError('El correo no tiene un formato válido.');
      return;
    }

    const payload: ProveedorPayload = {
      nit: form.nit.trim(),
      nombre: form.nombre.trim(),
      ciudad: form.ciudad.trim(),
      direccion: form.direccion.trim(),
      telefono: form.telefono.trim(),
      correo: form.correo.trim().toLowerCase(),
      descripcion: form.descripcion.trim() || undefined,
    };

    setGuardando(true);
    try {
      if (proveedor) {
        await actualizarProveedor(proveedor.id, payload);
      } else {
        await crearProveedor(payload);
      }
      onGuardado();
      onAbiertoChange(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No fue posible guardar el proveedor.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Dialog open={abierto} onOpenChange={onAbiertoChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogTitle>{proveedor ? 'Editar proveedor' : 'Nuevo proveedor'}</DialogTitle>
        <DialogDescription>
          El NIT es único. Los proveedores con productos o compras no se pueden eliminar.
        </DialogDescription>

        <form onSubmit={guardar} className="mt-2 space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="nit">NIT *</Label>
              <Input
                id="nit"
                value={form.nit}
                onChange={(e) => actualizar('nit', e.target.value)}
                placeholder="901201234-5"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={form.nombre}
                onChange={(e) => actualizar('nombre', e.target.value)}
                placeholder="Distribuidora Andina SAS"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="ciudad">Ciudad *</Label>
              <Input
                id="ciudad"
                value={form.ciudad}
                onChange={(e) => actualizar('ciudad', e.target.value)}
                placeholder="Bogotá"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="telefono">Teléfono *</Label>
              <Input
                id="telefono"
                value={form.telefono}
                onChange={(e) => actualizar('telefono', e.target.value)}
                placeholder="300 123 4567"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="direccion">Dirección *</Label>
            <Input
              id="direccion"
              value={form.direccion}
              onChange={(e) => actualizar('direccion', e.target.value)}
              placeholder="Cra 45 #12-34"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="correo">Correo *</Label>
            <Input
              id="correo"
              type="email"
              value={form.correo}
              onChange={(e) => actualizar('correo', e.target.value)}
              placeholder="ventas@proveedor.co"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={form.descripcion}
              onChange={(e) => actualizar('descripcion', e.target.value)}
              placeholder="Qué suministra, condiciones de pago, tiempos de entrega…"
            />
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
              {proveedor ? 'Guardar cambios' : 'Crear proveedor'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
