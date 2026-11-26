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
import { actualizarCliente, ApiError, crearCliente } from '@/lib/api';
import type { Cliente, ClientePayload } from '@/lib/types';

interface Props {
  abierto: boolean;
  onAbiertoChange: (abierto: boolean) => void;
  cliente: Cliente | null;
  onGuardado: () => void;
}

interface Formulario {
  nit: string;
  nombre: string;
  apellido: string;
  ciudad: string;
  sucursal: string;
  direccion: string;
  telefono: string;
  correo: string;
}

const VACIO: Formulario = {
  nit: '',
  nombre: '',
  apellido: '',
  ciudad: '',
  sucursal: '',
  direccion: '',
  telefono: '',
  correo: '',
};

export function ClienteFormDialog({ abierto, onAbiertoChange, cliente, onGuardado }: Props) {
  const [form, setForm] = useState<Formulario>(VACIO);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!abierto) return;

    setForm(
      cliente
        ? {
            nit: cliente.nit,
            nombre: cliente.nombre,
            apellido: cliente.apellido ?? '',
            ciudad: cliente.ciudad,
            sucursal: cliente.sucursal ?? '',
            direccion: cliente.direccion,
            telefono: cliente.telefono,
            correo: cliente.correo,
          }
        : VACIO,
    );
    setError(null);
  }, [abierto, cliente]);

  function actualizar<K extends keyof Formulario>(campo: K, valor: Formulario[K]) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function guardar(event: FormEvent<HTMLFormElement>) {
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

    const payload: ClientePayload = {
      nit: form.nit.trim(),
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      ciudad: form.ciudad.trim(),
      sucursal: form.sucursal.trim(),
      direccion: form.direccion.trim(),
      telefono: form.telefono.trim(),
      correo: form.correo.trim().toLowerCase(),
    };

    setGuardando(true);
    try {
      if (cliente) {
        await actualizarCliente(cliente.id, payload);
      } else {
        await crearCliente(payload);
      }
      onGuardado();
      onAbiertoChange(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No fue posible guardar el cliente.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Dialog open={abierto} onOpenChange={onAbiertoChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogTitle>{cliente ? 'Editar cliente' : 'Nuevo cliente'}</DialogTitle>
        <DialogDescription>
          El NIT es único. Los clientes con ventas o cotizaciones no se pueden eliminar.
        </DialogDescription>

        <form onSubmit={guardar} className="mt-2 space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="nit">NIT / Documento *</Label>
              <Input
                id="nit"
                value={form.nit}
                onChange={(e) => actualizar('nit', e.target.value)}
                placeholder="1065823456"
                maxLength={20}
                autoComplete="off"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={form.nombre}
                onChange={(e) => actualizar('nombre', e.target.value)}
                placeholder="Carlos"
                maxLength={100}
                autoComplete="given-name"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="apellido">Apellido</Label>
              <Input
                id="apellido"
                value={form.apellido}
                onChange={(e) => actualizar('apellido', e.target.value)}
                placeholder="Gómez"
                maxLength={100}
                autoComplete="family-name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ciudad">Ciudad *</Label>
              <Input
                id="ciudad"
                value={form.ciudad}
                onChange={(e) => actualizar('ciudad', e.target.value)}
                placeholder="Bogotá"
                maxLength={100}
                autoComplete="address-level2"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="sucursal">Sucursal</Label>
              <Input
                id="sucursal"
                value={form.sucursal}
                onChange={(e) => actualizar('sucursal', e.target.value)}
                placeholder="Principal"
                maxLength={100}
                autoComplete="off"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="telefono">Teléfono *</Label>
              <Input
                id="telefono"
                value={form.telefono}
                onChange={(e) => actualizar('telefono', e.target.value)}
                placeholder="300 123 4567"
                maxLength={20}
                autoComplete="tel"
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
              placeholder="Av 68 #95-22"
              maxLength={150}
              autoComplete="street-address"
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
              placeholder="cliente@correo.com"
              maxLength={150}
              autoComplete="email"
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
              {cliente ? 'Guardar cambios' : 'Crear cliente'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
