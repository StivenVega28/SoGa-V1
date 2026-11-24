import { useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { enviarContacto } from '@/lib/api';
import type { ContactPayload } from '@/lib/types';

const EMPTY: ContactPayload = {
  nombre: '',
  apellido: '',
  correo: '',
  telefono: '',
  asunto: '',
  mensaje: '',
};

export function QuoteSection() {
  const [form, setForm] = useState<ContactPayload>(EMPTY);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  function update(field: keyof ContactPayload, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    setError(null);
    try {
      if (!form.nombre || !form.correo || !form.asunto || !form.mensaje) {
        throw new Error('Completa nombre, correo, asunto y mensaje.');
      }
      await enviarContacto(form);
      setStatus('success');
      setForm(EMPTY);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'No fue posible enviar la solicitud.');
    }
  }

  return (
    <section id="contacto" className="border-b border-border/60">
      <div className="mx-auto grid max-w-[1200px] gap-12 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:py-20">
        <div>
          <p className="eyebrow">Contacto</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tightest sm:text-3xl">
            Solicita tu cotización
          </h2>
          <p className="mt-3 max-w-md text-[14px] leading-relaxed text-muted-foreground">
            Cuéntanos qué necesitas proteger o conectar. Un asesor revisará tu caso y responderá con
            una propuesta técnica y comercial detallada.
          </p>

          <dl className="mt-8 divide-y divide-border/60 border-y border-border/60">
            {[
              { k: 'Razón social', v: 'Soluciones Garantizadas PS S.A.S.' },
              { k: 'NIT', v: '901.712.788-9' },
              { k: 'Correo comercial', v: 'comercial@solucionesgarantizadas.com' },
              { k: 'Cobertura', v: 'Colombia · despacho nacional' },
            ].map((row) => (
              <div key={row.k} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                  {row.k}
                </dt>
                <dd className="text-right text-[13px] font-medium">{row.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-lg border border-border/60 bg-card p-6">
          {status === 'success' ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CheckCircle2 className="size-10 text-primary" />
              <h3 className="mt-4 text-lg font-semibold">Solicitud registrada</h3>
              <p className="mt-1 max-w-xs text-[13px] text-muted-foreground">
                Gracias. Un asesor se pondrá en contacto contigo a la brevedad.
              </p>
              <Button variant="outline" className="mt-6" onClick={() => setStatus('idle')}>
                Enviar otra solicitud
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    value={form.nombre}
                    onChange={(e) => update('nombre', e.target.value)}
                    placeholder="Carlos"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="apellido">Apellido</Label>
                  <Input
                    id="apellido"
                    value={form.apellido}
                    onChange={(e) => update('apellido', e.target.value)}
                    placeholder="Gómez"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="correo">Correo *</Label>
                  <Input
                    id="correo"
                    type="email"
                    value={form.correo}
                    onChange={(e) => update('correo', e.target.value)}
                    placeholder="tu@empresa.com"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={form.telefono}
                    onChange={(e) => update('telefono', e.target.value)}
                    placeholder="300 000 0000"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="asunto">Asunto *</Label>
                <Input
                  id="asunto"
                  value={form.asunto}
                  onChange={(e) => update('asunto', e.target.value)}
                  placeholder="Cotización de videovigilancia para bodega"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mensaje">Mensaje *</Label>
                <Textarea
                  id="mensaje"
                  value={form.mensaje}
                  onChange={(e) => update('mensaje', e.target.value)}
                  placeholder="Describe el inmueble, cantidad de puntos y plazos."
                  required
                />
              </div>

              {status === 'error' && (
                <p className="rounded-sm border border-destructive/25 bg-destructive/10 px-3 py-2 text-[12px] text-destructive">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-between gap-4 pt-1">
                <p className="text-[11px] text-muted-foreground">
                  Campos marcados con * son obligatorios.
                </p>
                <Button type="submit" disabled={status === 'loading'}>
                  {status === 'loading' && <Loader2 className="size-4 animate-spin" />}
                  Enviar solicitud
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
