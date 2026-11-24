import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';

const NAV = [
  { label: 'Productos', href: '#productos' },
  { label: 'Destacado', href: '#destacado' },
  { label: 'Nosotros', href: '#nosotros' },
  { label: 'Contacto', href: '#contacto' },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center gap-6 px-6">
        <a href="#inicio" className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-[5px] border border-primary/25 bg-primary/10">
            <ShieldCheck className="size-4 text-primary" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-[13px] font-bold tracking-tightest">Soluciones Garantizadas</span>
            <span className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              PS S.A.S.
            </span>
          </span>
        </a>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-sm px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 md:ml-2">
          <ThemeToggle />
          <Button asChild size="sm" variant="outline">
            <a href="/login">Iniciar sesión</a>
          </Button>
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <a href="#contacto">Solicitar cotización</a>
          </Button>
        </div>
      </div>
    </header>
  );
}
