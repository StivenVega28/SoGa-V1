import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RolFormDialog } from '@/components/admin/RolFormDialog';
import { ApiError, eliminarRol, listarRoles } from '@/lib/api';
import type { Rol } from '@/lib/types';

export function AdminRolesPage() {
  const queryClient = useQueryClient();

  const [formAbierto, setFormAbierto] = useState(false);
  const [rolEditando, setRolEditando] = useState<Rol | null>(null);
  const [accionError, setAccionError] = useState<string | null>(null);
  const [procesandoId, setProcesandoId] = useState<number | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['roles'],
    queryFn: listarRoles,
  });

  const roles = data?.data ?? [];

  function refrescar() {
    void queryClient.invalidateQueries({ queryKey: ['roles'] });
  }

  function abrirNuevo() {
    setRolEditando(null);
    setFormAbierto(true);
  }

  function abrirEdicion(rol: Rol) {
    setRolEditando(rol);
    setFormAbierto(true);
  }

  async function eliminar(rol: Rol) {
    const confirmado = window.confirm(`¿Eliminar el rol "${rol.nombre}"?`);
    if (!confirmado) return;

    setAccionError(null);
    setProcesandoId(rol.id);
    try {
      await eliminarRol(rol.id);
      refrescar();
    } catch (err) {
      setAccionError(err instanceof ApiError ? err.message : 'No fue posible eliminar el rol.');
    } finally {
      setProcesandoId(null);
    }
  }

  function permisosDe(rol: Rol): string[] {
    return rol.permisos
      ? rol.permisos.split(',').map((p) => p.trim()).filter(Boolean)
      : [];
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Seguridad</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tightest">Roles y permisos</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Define qué módulos puede ver cada rol.
          </p>
        </div>
        <Button onClick={abrirNuevo} size="sm">
          <Plus className="size-4" />
          Nuevo rol
        </Button>
      </div>

      {accionError && (
        <p
          role="alert"
          aria-live="polite"
          className="mt-3 rounded-sm border border-destructive/25 bg-destructive/10 px-3 py-2 text-[12px] text-destructive"
        >
          {accionError}
        </p>
      )}

      <div className="mt-4 overflow-hidden rounded-lg border border-border/60 bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-[12px]">
            <thead className="border-b border-border/60 bg-secondary/40 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-3 py-2.5 font-medium">Rol</th>
                <th className="px-3 py-2.5 font-medium">Permisos</th>
                <th className="px-3 py-2.5 text-center font-medium">Usuarios</th>
                <th className="px-3 py-2.5 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading &&
                Array.from({ length: 3 }).map((_, indice) => (
                  <tr key={indice}>
                    <td colSpan={4} className="px-3 py-3">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))}

              {!isLoading &&
                roles.map((rol) => {
                  const permisos = permisosDe(rol);
                  const esAdmin = rol.nombre === 'Administrador';
                  return (
                    <tr key={rol.id} className="transition-colors hover:bg-secondary/30">
                      <td className="px-3 py-2.5">
                        <span className="font-medium">{rol.nombre}</span>
                        <span className="block text-[11px] text-muted-foreground">
                          {rol.descripcion || 'Sin descripción'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-wrap gap-1">
                          {permisos.includes('todos') ? (
                            <Badge variant="entry">Todos</Badge>
                          ) : (
                            permisos.map((permiso) => (
                              <Badge key={permiso} variant="neutral">
                                {permiso}
                              </Badge>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="num px-3 py-2.5 text-center">{rol.usuarios ?? 0}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center justify-end gap-1">
                          {procesandoId === rol.id && (
                            <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Editar rol ${rol.nombre}`}
                            onClick={() => abrirEdicion(rol)}
                            disabled={procesandoId !== null}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Eliminar rol ${rol.nombre}`}
                            onClick={() => eliminar(rol)}
                            disabled={procesandoId !== null || esAdmin || (rol.usuarios ?? 0) > 0}
                            title={
                              esAdmin
                                ? 'No se puede eliminar el rol Administrador'
                                : (rol.usuarios ?? 0) > 0
                                  ? 'El rol tiene usuarios asignados'
                                  : undefined
                            }
                          >
                            <Trash2 className="size-3.5 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {!isLoading && roles.length === 0 && (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-muted-foreground">
              {isError ? 'No fue posible cargar los roles.' : 'No hay roles registrados.'}
            </p>
            {isError && (
              <Button variant="outline" size="sm" className="mt-4" onClick={() => void refetch()}>
                Reintentar
              </Button>
            )}
          </div>
        )}
      </div>

      <RolFormDialog
        abierto={formAbierto}
        onAbiertoChange={setFormAbierto}
        rol={rolEditando}
        onGuardado={refrescar}
      />
    </div>
  );
}
