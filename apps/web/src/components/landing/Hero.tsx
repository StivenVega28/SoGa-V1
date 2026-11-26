import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HeroCarousel } from './HeroCarousel';

export function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden border-b border-border/60">
      <div className="grid-lines pointer-events-none absolute inset-0 opacity-[0.35]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />

      <div className="relative mx-auto max-w-[1200px] px-6 py-20 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="animate-fade-up max-w-2xl">
            <Badge variant="neutral" className="mb-6 gap-1.5 py-1">
              <span className="size-1.5 rounded-full bg-primary" />
              Todo en muebles.
            </Badge>

            <h1 className="text-balance text-[2.6rem] font-extrabold leading-[1.05] tracking-tightest sm:text-5xl lg:text-[3.4rem]">
              Venta, reparación y mantenimiento de
              <span className="text-primary"> muebles y sus respectivos accesorios.</span>
            </h1>

            <p className="mt-5 max-w-xl text-pretty text-[15px] leading-relaxed text-muted-foreground">
              Vendemos, reparamos y hacemos mantenimiento de muebles para oficina y hogar. Diseño a
              medida, entrega e instalación con acompañamiento posventa.
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
                { k: 'Servicios', v: '03', s: 'venta, reparación y mantenimiento' },
                { k: 'Cobertura', v: 'Nacional', s: 'entrega e instalación' },
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

          <HeroCarousel />
        </div>
      </div>
    </section>
  );
}
