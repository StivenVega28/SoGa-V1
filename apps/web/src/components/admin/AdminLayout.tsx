import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Boxes,
  ExternalLink,
  FileText,
  LayoutDashboard,
  LogOut,
  Package,
  Receipt,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/landing/ThemeToggle';
import { cerrarSesion, obtenerPerfil } from '@/lib/api';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/admin', label: 'Inicio', icon: LayoutDashboard, end: true },
  { to: '/admin/productos', label: 'Productos', icon: Package },
  { to: '/admin/proveedores', label: 'Proveedores', icon: Truck },
  { to: '/admin/clientes', label: 'Clientes', icon: Users, pronto: true },
  { to: '/admin/compras', label: 'Compras', icon: ShoppingCart, pronto: true },
  { to: '/admin/inventario', label: 'Inventario', icon: Boxes, pronto: true },
  { to: '/admin/ventas', label: 'Ventas', icon: Receipt, pronto: true },
  { to: '/admin/cotizaciones', label: 'Cotizaciones', icon: FileText, pronto: true },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ['perfil'], queryFn: obtenerPerfil, staleTime: 60_000 });
  const usuario = data?.usuario;

  async function salir() {
    try {
      await cerrarSesion();
    } finally {
      queryClient.clear();
      navigate('/login', { replace: true });
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border/60 bg-surface/60 md:flex">
        <a href="/" className="flex h-14 items-center gap-2.5 border-b border-border/60 px-4">
          <span className="flex size-7 items-center justify-center rounded-[5px] border border-primary/25 bg-primary/10">
            <ShieldCheck className="size-4 text-primary" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-[13px] font-bold tracking-tightest">Soluciones Garantizadas</span>
            <span className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Panel · PS S.A.S.
            </span>
          </span>
        </a>

        <nav className="flex-1 space-y-0.5 p-2">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-sm px-3 py-2 text-[13px] font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
                  item.pronto && 'pointer-events-none opacity-50',
                )
              }
            >
              <item.icon className="size-4" />
              <span className="flex-1">{item.label}</span>
              {item.pronto && <span className="text-[9px] uppercase tracking-wider">Pronto</span>}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border/60 p-3">
          <a
            href="/"
            className="flex items-center gap-2 rounded-sm px-3 py-2 text-[12px] text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
          >
            <ExternalLink className="size-3.5" />
            Ver landing
          </a>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between gap-4 border-b border-border/60 bg-background/85 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3 md:hidden">
            <span className="flex size-7 items-center justify-center rounded-[5px] border border-primary/25 bg-primary/10">
              <ShieldCheck className="size-4 text-primary" />
            </span>
            <span className="text-[13px] font-bold tracking-tightest">SoGa</span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <ThemeToggle />
            <div className="hidden text-right sm:block">
              <p className="text-[12px] font-semibold leading-tight">
                {usuario ? `${usuario.nombre} ${usuario.apellido ?? ''}`.trim() : 'Usuario'}
              </p>
              <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                {usuario?.rol ?? 'Sin rol'}
              </p>
            </div>
            <Badge variant="neutral" className="hidden sm:inline-flex">
              {usuario?.correo ?? ''}
            </Badge>
            <Button variant="outline" size="sm" onClick={salir}>
              <LogOut className="size-3.5" />
              Salir
            </Button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
