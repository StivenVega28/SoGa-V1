import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Lock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/landing/ThemeToggle';
import { ApiError, iniciarSesion } from '@/lib/api';

export function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!correo || !contrasena) {
      setError('Ingresa tu correo y contraseña.');
      return;
    }

    setEnviando(true);
    try {
      await iniciarSesion(correo, contrasena);
      await queryClient.invalidateQueries({ queryKey: ['perfil'] });
      navigate('/admin', { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('Correo o contraseña incorrectos.');
      } else if (err instanceof ApiError && err.status === 429) {
        setError('Demasiados intentos. Espera un minuto e inténtalo de nuevo.');
      } else {
        setError(err instanceof Error ? err.message : 'No fue posible iniciar sesión.');
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-border/60 bg-surface/60 p-10 lg:flex">
        <div className="absolute inset-0 grid-lines opacity-[0.3]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/60" />

        <a href="/" className="relative flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-[6px] border border-primary/25 bg-primary/10">
            <ShieldCheck className="size-[18px] text-primary" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-[14px] font-bold tracking-tightest">Soluciones Garantizadas</span>
            <span className="mt-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              PS S.A.S.
            </span>
          </span>
        </a>

        <div className="relative max-w-sm">
          <p className="eyebrow">Panel administrativo</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tightest">
            Control operativo con precisión de libro contable.
          </h1>
          <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
            Productos, inventario, ventas, cotizaciones y clientes en un solo lugar. Cada movimiento
            queda trazado y auditable.
          </p>
        </div>

        <div className="relative flex items-center gap-2 rounded-md border border-border/60 bg-card px-3 py-2">
          <Lock className="size-4 text-primary" />
          <p className="text-[11px] text-muted-foreground">
            Acceso restringido · sesión segura con cookies httpOnly
          </p>
        </div>
      </aside>

      <main className="relative flex items-center justify-center px-6 py-12">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-sm">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Volver al inicio
          </a>

          <div className="mt-6">
            <p className="eyebrow">Iniciar sesión</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tightest">Bienvenido de nuevo</h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Ingresa con tu cuenta corporativa para administrar la operación.
            </p>
          </div>

          <form onSubmit={onSubmit} className="mt-7 space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="correo">Correo</Label>
              <Input
                id="correo"
                type="email"
                autoComplete="email"
                placeholder="admin@soga.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="contrasena">Contraseña</Label>
                <a href="#recuperar" className="text-[11px] text-primary hover:underline">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <Input
                id="contrasena"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="rounded-sm border border-destructive/25 bg-destructive/10 px-3 py-2 text-[12px] text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={enviando}>
              {enviando && <Loader2 className="size-4 animate-spin" />}
              {enviando ? 'Validando…' : 'Entrar al panel'}
            </Button>
          </form>

          <p className="mt-6 text-center text-[11px] text-muted-foreground">
            Acceso exclusivo para personal autorizado de Soluciones Garantizadas PS S.A.S.
          </p>
        </div>
      </main>
    </div>
  );
}
