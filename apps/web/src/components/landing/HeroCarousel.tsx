import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PackageSearch } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getCatalogo } from '@/lib/api';
import { FALLBACK_CATALOG } from '@/lib/fallbackCatalog';
import { cn } from '@/lib/utils';

/** Milisegundos entre cada avance automático. */
const INTERVALO_MS = 5000;

/**
 * Carrusel de solo imágenes para el lado derecho del Hero.
 * Muestra únicamente la foto principal de cada producto (la que termina en `1`),
 * sin texto, con avance automático y puntos de navegación.
 */
export function HeroCarousel() {
  const { data, isLoading } = useQuery({
    queryKey: ['catalogo'],
    queryFn: getCatalogo,
    retry: 1,
  });

  // Si la API está caída se usa el catálogo local de respaldo.
  const products = data?.data?.length ? data.data : FALLBACK_CATALOG;

  // Solo las imágenes que terminan en `1` (la foto principal de cada producto).
  const imagenes = products
    .flatMap((producto) => producto.imagenes)
    .filter((imagen) => imagen.endsWith('-1.png'));

  const total = imagenes.length;
  const [indice, setIndice] = useState(0);
  const [pausado, setPausado] = useState(false);

  useEffect(() => setIndice(0), [total]);

  // Avance automático: cada cambio de `indice` agenda el siguiente.
  useEffect(() => {
    if (pausado || total <= 1) return;
    const timer = setTimeout(() => {
      setIndice((prev) => (prev + 1) % total);
    }, INTERVALO_MS);
    return () => clearTimeout(timer);
  }, [indice, pausado, total]);

  if (isLoading) {
    return <Skeleton className="h-72 w-full rounded-lg lg:h-80" />;
  }

  if (total === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-lg border border-border/60 bg-secondary/30 lg:h-80">
        <PackageSearch className="size-16 text-muted-foreground/40" />
      </div>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
    >
      <div className="overflow-hidden rounded-lg border border-border/60 bg-secondary/30">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${indice * 100}%)` }}
        >
          {imagenes.map((src, i) => (
            <div key={`${src}-${i}`} className="flex w-full shrink-0 items-center justify-center p-8">
              <img
                src={src}
                alt={`Producto ${i + 1}`}
                className="h-72 w-full object-contain lg:h-80"
              />
            </div>
          ))}
        </div>
      </div>

      {total > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {imagenes.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Imagen ${i + 1}`}
              aria-current={i === indice}
              onClick={() => setIndice(i)}
              className={cn(
                'size-2 rounded-full transition-all',
                i === indice
                  ? 'w-5 bg-primary'
                  : 'bg-muted-foreground/40 hover:bg-muted-foreground/70',
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
