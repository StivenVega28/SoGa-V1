import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { obtenerPerfil } from '@/lib/api';

export function RutaProtegida() {
  const location = useLocation();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['perfil'],
    queryFn: obtenerPerfil,
    retry: false,
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !data?.usuario) {
    return <Navigate to="/login" replace state={{ desde: location.pathname }} />;
  }

  return <Outlet />;
}
