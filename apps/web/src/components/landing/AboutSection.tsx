import { Building2, Compass, Handshake, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Confiabilidad',
    text: 'Productos certificados y procesos de suministro verificables de principio a fin.',
  },
  {
    icon: Compass,
    title: 'Asesoría técnica',
    text: 'Diagnóstico del riesgo y diseño de la solución según cada inmueble y operación.',
  },
  {
    icon: Handshake,
    title: 'Compromiso',
    text: 'Acompañamiento comercial y soporte posterior a la instalación.',
  },
];

const COMPANY_DATA = [
  { k: 'Razón social', v: 'Soluciones Garantizadas PS S.A.S.' },
  { k: 'NIT', v: '901.712.788-9' },
  { k: 'Sede', v: 'Bogotá, Colombia' },
  { k: 'Cobertura', v: 'Despacho nacional' },
  { k: 'Correo', v: 'comercial@solucionesgarantizadas.com' },
];

export function AboutSection() {
  return (
    <section id="nosotros" className="border-b border-border/60">
      <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <p className="eyebrow">Nosotros</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tightest sm:text-3xl">
              Somos Soluciones Garantizadas
            </h2>

            <div className="mt-4 max-w-xl space-y-4 text-[14px] leading-relaxed text-muted-foreground">
              <p>
                Somos una empresa Santandereana con 10 años de
                experiencia dedicada al Diseño, fabricación, instalación
                optimización de espacios tales como: Oficinas, locales
                comerciales, aulas de clase, viviendas, fabricación y venta de
                sillas ergonómicas.
              </p>
              <p>
                Trabajamos con proveedores certificados y mantenemos trazabilidad sobre cada
                producto que entra, se despacha y se factura. Esa disciplina es la que nos permite
                garantizar disponibilidad, precios claros y soporte real.
              </p>
              <p>
                Nuestro enfoque es simple: entender el riesgo del cliente, proponer la solución
                adecuada y respaldarla con un servicio que no desaparece después de la venta.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              <Badge variant="neutral">Conectividad</Badge>
              <Badge variant="outline">Despacho nacional</Badge>
            </div>
          </div>

          <div className="rounded-lg border border-border/60 bg-card">
            <div className="flex items-center gap-2 border-b border-border/60 px-5 py-3">
              <Building2 className="size-4 text-primary" />
              <span className="text-[13px] font-semibold">Datos de la empresa</span>
            </div>
            <dl className="divide-y divide-border/50">
              {COMPANY_DATA.map((row) => (
                <div key={row.k} className="flex items-center justify-between gap-4 px-5 py-3">
                  <dt className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {row.k}
                  </dt>
                  <dd className="text-right text-[13px] font-medium">{row.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-border/60 bg-border/60 sm:grid-cols-3">
          {VALUES.map((item) => (
            <div key={item.title} className="bg-card p-5">
              <span className="flex size-9 items-center justify-center rounded-md border border-border/60 bg-secondary/50">
                <item.icon className="size-[18px] text-primary" />
              </span>
              <h3 className="mt-4 text-[14px] font-semibold">{item.title}</h3>
              <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
