import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, PackageSearch } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getCatalogo } from '@/lib/api';
import { FALLBACK_CATALOG } from '@/lib/fallbackCatalog';
import type { Producto } from '@/lib/types';
import { cn, formatCOP } from '@/lib/utils';

const CATEGORIES = ['Todas', 'Seguridad', 'Hogar', 'Tecnología'];

function ProductCard({ product }: { product: Producto }) {
  return (
    <article className="group relative flex flex-col rounded-lg border border-border/60 bg-card transition-colors hover:border-border">
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg border-b border-border/60 bg-secondary/40">
        {product.imagen ? (
          <img
            src={product.imagen}
            alt={product.nombre}
            loading="lazy"
            className="size-full object-contain p-6 transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <PackageSearch className="size-8 text-muted-foreground/50" />
          </div>
        )}
        <Badge variant="neutral" className="absolute left-3 top-3">
          {product.categoria}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-[14px] font-semibold leading-snug">{product.nombre}</h3>
        <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">
          {product.descripcion}
        </p>

        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <span className="block text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Precio unitario
            </span>
            <span className="num text-[15px] font-semibold">{formatCOP(product.precio)}</span>
          </div>
          <a
            href="#contacto"
            className="inline-flex items-center gap-1 rounded-sm px-2 py-1 text-[12px] font-medium text-primary opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
          >
            Cotizar
            <ArrowUpRight className="size-3.5" />
          </a>
        </div>
      </div>
    </article>
  );
}

function CatalogSkeleton() {
  return (
    <article className="flex flex-col rounded-lg border border-border/60 bg-card">
      <Skeleton className="aspect-[4/3] rounded-t-lg rounded-b-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex items-end justify-between pt-3">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </article>
  );
}

export function CatalogSection() {
  const [category, setCategory] = useState('Todas');
  const { data, isLoading } = useQuery({
    queryKey: ['catalogo'],
    queryFn: getCatalogo,
    retry: 1,
  });

  const products = data?.data?.length ? data.data : FALLBACK_CATALOG;

  const filtered = useMemo(
    () => (category === 'Todas' ? products : products.filter((p) => p.categoria === category)),
    [products, category],
  );

  return (
    <section id="productos" className="border-b border-border/60">
      <div className="mx-auto max-w-[1200px] px-6 py-16 lg:py-20">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Catálogo</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tightest sm:text-3xl">
              Equipamiento listo para despacho
            </h2>
            <p className="mt-2 max-w-lg text-[14px] text-muted-foreground">
              Precios en pesos colombianos. Disponibilidad sujeta al kardex de inventario en tiempo
              real.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={cn(
                  'rounded-sm border px-3 py-1.5 text-[12px] font-medium transition-colors',
                  category === item
                    ? 'border-primary/25 bg-primary/10 text-primary'
                    : 'border-border/60 bg-transparent text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <CatalogSkeleton key={i} />)
            : filtered.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>

        {!isLoading && filtered.length === 0 && (
          <div className="mt-8 rounded-lg border border-dashed border-border/60 py-16 text-center">
            <p className="text-sm text-muted-foreground">No hay productos en esta categoría.</p>
          </div>
        )}
      </div>
    </section>
  );
}
