import { ArrowRight, ShieldCheck, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCOP } from '@/lib/utils';

const SNAPSHOT = [
  { label: 'Cámaras HD', value: '50', estado: 'Optimo', variant: 'entry' as const },
  { label: 'Kits alarma', value: '30', estado: 'Optimo', variant: 'entry' as const },
  { label: 'Cerraduras', value: '08', estado: 'Minimo', variant: 'warning' as const },
  { label: 'Routers WiFi 6', value: '00', estado: 'Agotado', variant: 'danger' as const },
];

export function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden border-b border-border/60">
      <div className="grid-lines pointer-events-none absolute inset-0 opacity-[0.35]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />

      <div className="relative mx-auto grid max-w-[1200px] items-center gap-12 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
        <div className="animate-fade-up">
          <Badge variant="neutral" className="mb-6 gap-1.5 py-1">
            <span className="size-1.5 rounded-full bg-primary" />
            Seguridad, hogar y tecnología · Colombia
          </Badge>

          <h1 className="text-balance text-[2.6rem] font-extrabold leading-[1.05] tracking-tightest sm:text-5xl lg:text-[3.4rem]">
            Seguridad y tecnología con
            <span className="text-primary"> precisión de libro contable.</span>
          </h1>

          <p className="mt-5 max-w-xl text-pretty text-[15px] leading-relaxed text-muted-foreground">
            Diseñamos, abastecemos e instalamos soluciones de videovigilancia, alarmas, domótica y
            conectividad para empresas y hogares. Cada movimiento, cotización y despacho queda
            trazado, sin ambigüedades.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <a href="#productos">
                Ver catálogo
                <ArrowRight className="size-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#contacto">Hablar con un asesor</a>
            </Button>
          </div>

          <dl className="mt-10 grid max-w-lg grid-cols-3 divide-x divide-border/60 border-y border-border/60">
            {[
              { k: 'Productos', v: '06', s: 'en catálogo' },
              { k: 'Cobertura', v: 'Nacional', s: 'despacho' },
              { k: 'Trazabilidad', v: '100%', s: 'por movimiento' },
            ].map((item) => (
              <div key={item.k} className="px-4 py-3 first:pl-0 last:pr-0">
                <dt className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {item.k}
                </dt>
                <dd className="num mt-1 text-lg font-semibold">{item.v}</dd>
                <dd className="text-[11px] text-muted-foreground">{item.s}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="animate-fade-up lg:justify-self-end">
          <div className="w-full max-w-md rounded-lg border border-border/60 bg-card">
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-4 text-primary" />
                <span className="text-[13px] font-semibold">Snapshot de inventario</span>
              </div>
              <Badge variant="outline">Kardex · vivo</Badge>
            </div>

            <ul className="divide-y divide-border/50">
              {SNAPSHOT.map((row) => (
                <li key={row.label} className="flex h-11 items-center gap-3 px-4">
                  <span className="flex-1 truncate text-[13px] text-foreground/90">{row.label}</span>
                  <span className="num w-10 text-right text-[13px] font-medium">{row.value}</span>
                  <Badge variant={row.variant} className="w-[86px] justify-center">
                    {row.estado}
                  </Badge>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between border-t border-border/60 px-4 py-3">
              <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                Valor inventario
              </span>
              <span className="num text-[13px] font-semibold">{formatCOP(6436700)}</span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 rounded-md border border-border/60 bg-card px-3 py-2">
            <ShieldCheck className="size-4 text-primary" />
            <p className="text-[11px] text-muted-foreground">
              Movimientos atómicos · stock derivado del kardex, no editado a mano.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
