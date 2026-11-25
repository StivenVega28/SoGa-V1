import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, PackageSearch } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getCatalogo } from '@/lib/api';
import { FALLBACK_CATALOG } from '@/lib/fallbackCatalog';
import type { Producto } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ProductDetailDialog } from './ProductDetailDialog';

const CATEGORIES = ['Todas', 'Sillas'];

function ProductCard({ product, onSelect }: { product: Producto; onSelect: () => void }) {
  return (
    <article className="group relative flex flex-col rounded-lg border border-border/60 bg-card transition-colors hover:border-primary/40">
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg border-b border-border/60 bg-secondary/40">
        {product.imagenes[0] ? (
          <img
            src={product.imagenes[0]}
            alt={product.nombre}
            loading="lazy"
            className="size-full object-contain p-4 transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <PackageSearch className="size-8 text-muted-foreground/50" />
          </div>
        )}
        <Badge variant="neutral" className="absolute left-3 top-3">
          {product.categoria}
        </Badge>
        {product.destacado && (
          <Badge variant="entry" className="absolute right-3 top-3">
            Destacado
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-[14px] font-semibold leading-snug">{product.nombre}</h3>
        <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">
          {product.descripcion}
        </p>

        <div className="mt-auto flex items-center justify-between border-t border-border/50 pt-3">
          <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            Ver detalle
          </span>
          <span className="inline-flex items-center gap-1 text-[12px] font-medium text-primary">
            Ver ficha
            <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onSelect}
        aria-label={`Ver detalle de ${product.nombre}`}
        className="absolute inset-0 z-10 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      />
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
        <div className="flex items-end justify-between pb-1 pt-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-14" />
        </div>
      </div>
    </article>
  );
}

export function CatalogSection() {
  const [category, setCategory] = useState('Todas');
  const [selected, setSelected] = useState<Producto | null>(null);
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
              Nuestros productos
            </h2>
            <p className="mt-2 max-w-lg text-[14px] text-muted-foreground">
              Sillas para oficina y hogar. Entrega, instalación y mantenimiento en toda Colombia.
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
            : filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={() => setSelected(product)}
                />
              ))}
        </div>

        {!isLoading && filtered.length === 0 && (
          <div className="mt-8 rounded-lg border border-dashed border-border/60 py-16 text-center">
            <p className="text-sm text-muted-foreground">No hay productos en esta categoría.</p>
          </div>
        )}
      </div>

      <ProductDetailDialog
        product={selected}
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </section>
  );
}
