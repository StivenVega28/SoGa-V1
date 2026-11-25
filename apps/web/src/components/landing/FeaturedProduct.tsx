import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getDestacado } from '@/lib/api';
import { FALLBACK_CATALOG } from '@/lib/fallbackCatalog';

export function FeaturedProduct() {
  const { data, isLoading } = useQuery({
    queryKey: ['destacado'],
    queryFn: getDestacado,
    retry: 1,
  });

  const product = data?.data ?? FALLBACK_CATALOG[0];

  return (
    <section id="destacado" className="border-b border-border/60 bg-surface/60">
      <div className="mx-auto grid max-w-[1200px] items-stretch gap-0 px-6 py-16 lg:grid-cols-2 lg:py-0">
        <div className="flex flex-col justify-center py-2 lg:py-20 lg:pr-12">
          <p className="eyebrow">Producto destacado</p>

          {isLoading ? (
            <div className="mt-3 space-y-3">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-full max-w-md" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            <>
              <h2 className="mt-2 text-2xl font-bold tracking-tightest sm:text-3xl">
                {product.nombre}
              </h2>
              <p className="mt-3 max-w-md text-[14px] leading-relaxed text-muted-foreground">
                {product.descripcion}
              </p>
            </>
          )}

          <ul className="mt-6 space-y-2.5">
            {[
              'Tapicería y estructura de alta resistencia',
              'Entrega e instalación en oficina u hogar',
              'Reparación y mantenimiento posventa',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-[13px]">
                <ShieldCheck className="size-4 shrink-0 text-primary" />
                <span className="text-foreground/90">{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button asChild>
              <a href="#contacto">
                Solicitar cotización
                <ArrowRight className="size-4" />
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="#productos">Ver todo el catálogo</a>
            </Button>
          </div>
        </div>

        <div className="relative flex items-center justify-center border-t border-border/60 bg-secondary/30 py-12 lg:border-l lg:border-t-0">
          <div className="absolute inset-0 grid-lines opacity-[0.25]" />
          <div className="relative">
            {isLoading ? (
              <Skeleton className="size-64 rounded-lg" />
            ) : (
              <img
                src={product.imagenes[0] ?? ''}
                alt={product.nombre}
                className="size-64 object-contain drop-shadow-none sm:size-72"
              />
            )}
            <Badge variant="entry" className="absolute -right-2 top-0">
              Destacado
            </Badge>
          </div>
        </div>
      </div>
    </section>
  );
}
