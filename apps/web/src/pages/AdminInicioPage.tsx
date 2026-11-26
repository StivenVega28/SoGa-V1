import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, Boxes, Package, Receipt, ShoppingCart, Truck, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  listarCategorias,
  listarCompras,
  listarInventario,
  listarProductos,
  listarProveedores,
  listarVentas,
  obtenerPerfil,
} from '@/lib/api';
import { tienePermiso } from '@/lib/permisos';

interface Tarjeta {
  titulo: string;
  valor: string | number;
  detalle: string;
  icon: LucideIcon;
  to?: string;
}

export function AdminInicioPage() {
  const { data: perfil } = useQuery({ queryKey: ['perfil'], queryFn: obtenerPerfil });
  const permisos = perfil?.usuario?.permisos ?? null;

  const puedeProductos = tienePermiso(permisos, 'productos');
  const puedeProveedores = tienePermiso(permisos, 'proveedores');
  const puedeCompras = tienePermiso(permisos, 'compras');
  const puedeVentas = tienePermiso(permisos, 'ventas');
  const puedeInventario = tienePermiso(permisos, 'inventario');

  const { data: productos } = useQuery({
    queryKey: ['productos', 'resumen'],
    queryFn: () => listarProductos({ porPagina: 1 }),
    enabled: puedeProductos,
  });
  const { data: categorias } = useQuery({
    queryKey: ['categorias'],
    queryFn: listarCategorias,
    enabled: puedeProductos,
  });
  const { data: proveedores } = useQuery({
    queryKey: ['proveedores', 'resumen'],
    queryFn: () => listarProveedores({ porPagina: 1 }),
    enabled: puedeProveedores,
  });
  const { data: compras } = useQuery({
    queryKey: ['compras', 'resumen'],
    queryFn: () => listarCompras({ porPagina: 1 }),
    enabled: puedeCompras,
  });
  const { data: ventas } = useQuery({
    queryKey: ['ventas', 'resumen'],
    queryFn: () => listarVentas({ porPagina: 1 }),
    enabled: puedeVentas,
  });
  const { data: inventario } = useQuery({
    queryKey: ['inventario', 'resumen'],
    queryFn: () => listarInventario({ porPagina: 1 }),
    enabled: puedeInventario,
  });

  const tarjetas: Tarjeta[] = [
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
      titulo: 'Compras',
      valor: compras?.meta.total ?? '—',
      detalle: 'entradas al inventario',
      icon: ShoppingCart,
      to: '/admin/compras',
    },
    {
      titulo: 'Ventas',
      valor: ventas?.meta.total ?? '—',
      detalle: 'salidas confirmadas',
      icon: Receipt,
      to: '/admin/ventas',
    },
    {
      titulo: 'Inventario',
      valor: inventario?.meta.total ?? '—',
      detalle: 'productos con stock',
      icon: Boxes,
      to: '/admin/inventario',
    },
  ].filter((tarjeta) => {
    if (tarjeta.titulo === 'Productos' || tarjeta.titulo === 'Categorías') return puedeProductos;
    if (tarjeta.titulo === 'Proveedores') return puedeProveedores;
    if (tarjeta.titulo === 'Compras') return puedeCompras;
    if (tarjeta.titulo === 'Ventas') return puedeVentas;
    return puedeInventario;
  });

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
        {puedeProductos && (
          <Button asChild size="sm">
            <Link to="/admin/productos">
              Gestionar productos
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        )}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tarjetas.map((tarjeta) => {
          const contenido = (
            <>
              <div className="flex items-center justify-between">
                <span className="flex size-8 items-center justify-center rounded-md border border-border/60 bg-secondary/50">
                  <tarjeta.icon className="size-4 text-primary" />
                </span>
                {tarjeta.to && <ArrowRight className="size-4 text-muted-foreground" />}
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
            <div key={tarjeta.titulo} className="rounded-lg border border-border/60 bg-card p-4">
              {contenido}
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-lg border border-border/60 bg-card p-5">
        <h2 className="text-[14px] font-semibold">Siguientes módulos</h2>
        <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-muted-foreground">
          Con compras, ventas e inventario funcionando, el siguiente paso es el módulo de
          cotizaciones y, más adelante, la auditoría y los permisos por módulo.
        </p>
      </div>
    </div>
  );
}
