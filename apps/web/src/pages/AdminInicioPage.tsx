import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, Boxes, Package, Receipt, Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { listarCategorias, listarProductos, listarProveedores } from '@/lib/api';

export function AdminInicioPage() {
  const { data: productos } = useQuery({
    queryKey: ['productos', 'resumen'],
    queryFn: () => listarProductos({ porPagina: 1 }),
  });

  const { data: categorias } = useQuery({
    queryKey: ['categorias'],
    queryFn: listarCategorias,
  });

  const { data: proveedores } = useQuery({
    queryKey: ['proveedores', 'resumen'],
    queryFn: () => listarProveedores({ porPagina: 1 }),
  });

  const tarjetas = [
    {
      titulo: 'Productos',
      valor: productos?.meta.total ?? '—',
      detalle: 'referencias activas e inactivas',
      icon: Package,
      to: '/admin/productos',
    },
    {
      titulo: 'Categorías',
      valor: categorias?.data.length ?? '—',
      detalle: 'agrupaciones del catálogo',
      icon: Boxes,
    },
    {
      titulo: 'Proveedores',
      valor: proveedores?.meta.total ?? '—',
      detalle: 'abastecen el catálogo',
      icon: Truck,
      to: '/admin/proveedores',
    },
    {
      titulo: 'Ventas',
      valor: '—',
      detalle: 'módulo pendiente',
      icon: Receipt,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Panel administrativo</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tightest">Resumen operativo</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Estado actual del catálogo y accesos rápidos a los módulos.
          </p>
        </div>
        <Button asChild size="sm">
          <Link to="/admin/productos">
            Gestionar productos
            <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tarjetas.map((tarjeta) => {
          const contenido = (
            <>
              <div className="flex items-center justify-between">
                <span className="flex size-8 items-center justify-center rounded-md border border-border/60 bg-secondary/50">
                  <tarjeta.icon className="size-4 text-primary" />
                </span>
                {tarjeta.to ? (
                  <ArrowRight className="size-4 text-muted-foreground" />
                ) : (
                  <Badge variant="outline">Pronto</Badge>
                )}
              </div>
              <p className="mt-4 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                {tarjeta.titulo}
              </p>
              <p className="num mt-1 text-2xl font-semibold">{tarjeta.valor}</p>
              <p className="text-[11px] text-muted-foreground">{tarjeta.detalle}</p>
            </>
          );

          return tarjeta.to ? (
            <Link
              key={tarjeta.titulo}
              to={tarjeta.to}
              className="rounded-lg border border-border/60 bg-card p-4 transition-colors hover:border-primary/40"
            >
              {contenido}
            </Link>
          ) : (
            <div key={tarjeta.titulo} className="rounded-lg border border-border/60 bg-card p-4 opacity-70">
              {contenido}
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-lg border border-border/60 bg-card p-5">
        <h2 className="text-[14px] font-semibold">Siguientes módulos</h2>
        <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-muted-foreground">
          Con el catálogo y las variantes listas, el siguiente paso es compras (entrada de kardex),
          ventas con descuento de stock y el panel de usuarios y roles.
        </p>
      </div>
    </div>
  );
}
