import { ShieldCheck } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function SiteFooter() {
  return (
    <footer className="bg-surface/60">
      <div className="mx-auto max-w-[1200px] px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-[5px] border border-primary/25 bg-primary/10">
                <ShieldCheck className="size-4 text-primary" />
              </span>
              <span className="text-[13px] font-bold tracking-tightest">
                Soluciones Garantizadas PS S.A.S.
              </span>
            </div>
            <p className="mt-3 max-w-sm text-[12px] leading-relaxed text-muted-foreground">
              Venta, reparación y mantenimiento de muebles para oficina y hogar. NIT 901.712.788-9.
            </p>
          </div>

          <div>
            <p className="eyebrow">Navegación</p>
            <ul className="mt-3 space-y-2 text-[13px]">
              {[
                ['Productos', '#productos'],
                ['Destacado', '#destacado'],
                ['Nosotros', '#nosotros'],
                ['Contacto', '#contacto'],
                ['Iniciar sesión', '/login'],
              ].map(([label, href]) => (
                <li key={href}>
                  <a href={href} className="text-muted-foreground transition-colors hover:text-foreground">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow">Contacto</p>
            <ul className="mt-3 space-y-2 text-[13px] text-muted-foreground">
              <li>comercial@solucionesgarantizadas.com</li>
              <li className="num">+57 301 433 3665</li>
              <li>Bogotá, Colombia</li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
          <p className="text-[11px] text-muted-foreground">
            © {new Date().getFullYear()} Soluciones Garantizadas PS S.A.S. Todos los derechos
            reservados.
          </p>
          <p className="text-[11px] text-muted-foreground">
            Precisión Ledger · diseño de interfaz
          </p>
        </div>
      </div>
    </footer>
  );
}
