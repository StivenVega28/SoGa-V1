import { useEffect, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, ImageOff, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { Producto } from '@/lib/types';

interface ProductDetailDialogProps {
  product: Producto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BENEFITS = [
  'Fabricación y tapicería con materiales de alta resistencia',
  'Entrega e instalación en oficina u hogar',
  'Garantía y mantenimiento posventa',
];

export function ProductDetailDialog({ product, open, onOpenChange }: ProductDetailDialogProps) {
  const [index, setIndex] = useState(0);
  const images = product?.imagenes ?? [];

  useEffect(() => {
    setIndex(0);
  }, [product?.id]);

  function goTo(next: number) {
    if (images.length === 0) return;
    setIndex((next + images.length) % images.length);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowRight') goTo(index + 1);
    if (event.key === 'ArrowLeft') goTo(index - 1);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl gap-0 overflow-y-auto p-0 sm:rounded-lg">
        {product && (
          <div className="grid md:grid-cols-2" onKeyDown={onKeyDown}>
            <DialogTitle className="sr-only">{product.nombre}</DialogTitle>
            <DialogDescription className="sr-only">
              {product.descripcion}
            </DialogDescription>

            <div className="relative border-b border-border/60 bg-secondary/40 md:border-b-0 md:border-r">
              <div className="relative flex aspect-[4/3] items-center justify-center p-6">
                {images.length > 0 ? (
                  <img
                    key={images[index]}
                    src={images[index]}
                    alt={`${product.nombre} — foto ${index + 1} de ${images.length}`}
                    className="size-full object-contain"
                  />
                ) : (
                  <ImageOff className="size-10 text-muted-foreground/50" />
                )}

                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => goTo(index - 1)}
                      aria-label="Foto anterior"
                      className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-background/90 text-foreground transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => goTo(index + 1)}
                      aria-label="Foto siguiente"
                      className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-background/90 text-foreground transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex items-center justify-center gap-2 pb-5">
                  {images.map((image, dotIndex) => (
                    <button
                      key={image}
                      type="button"
                      onClick={() => goTo(dotIndex)}
                      aria-label={`Ver foto ${dotIndex + 1}`}
                      aria-current={dotIndex === index}
                      className={cn(
                        'h-1.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        dotIndex === index
                          ? 'w-6 bg-primary'
                          : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60',
                      )}
                    />
                  ))}
                  <span className="num ml-1 text-[10px] text-muted-foreground">
                    {index + 1} / {images.length}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="neutral">{product.categoria}</Badge>
                {product.destacado && <Badge variant="entry">Destacado</Badge>}
              </div>

              <h2 className="mt-4 text-xl font-bold tracking-tightest sm:text-2xl">
                {product.nombre}
              </h2>

              <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
                {product.descripcion}
              </p>

              <ul className="mt-5 space-y-2.5">
                {BENEFITS.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[12px]">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span className="text-foreground/90">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
                <Button asChild onClick={() => onOpenChange(false)}>
                  <a href="#contacto">
                    Solicitar cotización
                    <ArrowRight className="size-4" />
                  </a>
                </Button>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Seguir viendo
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
