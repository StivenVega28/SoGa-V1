import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  KeyRound,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { RestablecerContrasenaDialog } from '@/components/admin/RestablecerContrasenaDialog';
import { UsuarioFormDialog } from '@/components/admin/UsuarioFormDialog';
import { ApiError, eliminarUsuario, listarRoles, listarUsuarios, obtenerPerfil, restaurarUsuario } from '@/lib/api';
import type { Usuario } from '@/lib/types';

const POR_PAGINA = 10;

const CLASE_SELECT =
  'h-9 rounded-md border border-input bg-background px-2 text-[12px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export function AdminUsuariosPage() {
  const queryClient = useQueryClient();

  const [buscar, setBuscar] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [rolId, setRolId] = useState('');
  const [estado, setEstado] = useState<'activos' | 'eliminados'>('activos');
  const [pagina, setPagina] = useState(1);

  const [formAbierto, setFormAbierto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [resetAbierto, setResetAbierto] = useState(false);
  const [usuarioReset, setUsuarioReset] = useState<Usuario | null>(null);

  const [accionError, setAccionError] = useState<string | null>(null);
  const [procesandoId, setProcesandoId] = useState<string | null>(null);

  const filtros = {
    buscar: busqueda || undefined,
    rolId: rolId ? Number(rolId) : undefined,
    estado,
    pagina,
    porPagina: POR_PAGINA,
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['usuarios', filtros],
    queryFn: () => listarUsuarios(filtros),
  });

  const { data: rolesData } = useQuery({
    queryKey: ['roles'],
    queryFn: listarRoles,
  });

  const { data: perfil } = useQuery({
    queryKey: ['perfil'],
    queryFn: obtenerPerfil,
  });

  const usuarios = data?.data ?? [];
  const meta = data?.meta;
  const roles = rolesData?.data ?? [];
  const miId = perfil?.usuario?.id;
  const esAdministrador = perfil?.usuario?.rol === 'Administrador';

  function refrescar() {
    void queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    void queryClient.invalidateQueries({ queryKey: ['perfil'] });
  }

  function abrirNuevo() {
    setUsuarioEditando(null);
    setFormAbierto(true);
  }

  function abrirEdicion(usuario: Usuario) {
    setUsuarioEditando(usuario);
    setFormAbierto(true);
  }

  function abrirReset(usuario: Usuario) {
    setUsuarioReset(usuario);
    setResetAbierto(true);
  }

  async function eliminar(usuario: Usuario) {
    const confirmado = window.confirm(`¿Dar de baja al usuario "${usuario.nombre}"?`);
    if (!confirmado) return;

    setAccionError(null);
    setProcesandoId(usuario.id);
    try {
      await eliminarUsuario(usuario.id);
      refrescar();
    } catch (err) {
      setAccionError(err instanceof ApiError ? err.message : 'No fue posible eliminar el usuario.');
    } finally {
      setProcesandoId(null);
    }
  }

  async function restaurar(usuario: Usuario) {
    setAccionError(null);
    setProcesandoId(usuario.id);
    try {
      await restaurarUsuario(usuario.id);
      refrescar();
    } catch (err) {
      setAccionError(err instanceof ApiError ? err.message : 'No fue posible restaurar el usuario.');
    } finally {
      setProcesandoId(null);
    }
  }

  if (perfil && !esAdministrador) {
    return (
      <div className="mx-auto max-w-3xl rounded-lg border border-border/60 bg-card p-8 text-center">
        <h1 className="text-lg font-semibold">Sin permisos</h1>
        <p className="mt-2 text-[13px] text-muted-foreground">
          Solo un Administrador puede gestionar los usuarios del sistema.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Seguridad</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tightest">Usuarios</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Cuentas de acceso, roles y estado de los usuarios del sistema.
          </p>
        </div>
        <Button onClick={abrirNuevo} size="sm">
          <Plus className="size-4" />
          Nuevo usuario
        </Button>
      </div>

      <form
        className="mt-5 flex flex-wrap items-end gap-2 rounded-lg border border-border/60 bg-card p-3"
        onSubmit={(event) => {
          event.preventDefault();
          setPagina(1);
          setBusqueda(buscar.trim());
        }}
      >
        <div className="min-w-[220px] flex-1 space-y-1">
          <label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Buscar
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
              placeholder="Nombre, correo o documento"
              maxLength={100}
              className="h-9 pl-8"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Rol
          </label>
          <select
            className={CLASE_SELECT}
            value={rolId}
            onChange={(e) => {
              setRolId(e.target.value);
              setPagina(1);
            }}
          >
            <option value="">Todos</option>
            {roles.map((rol) => (
              <option key={rol.id} value={rol.id}>
                {rol.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Estado
          </label>
          <select
            className={CLASE_SELECT}
            value={estado}
            onChange={(e) => {
              setEstado(e.target.value as 'activos' | 'eliminados');
              setPagina(1);
            }}
          >
            <option value="activos">Activos</option>
            <option value="eliminados">Eliminados</option>
          </select>
        </div>

        <Button type="submit" variant="outline" size="sm">
          Buscar
        </Button>
      </form>

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
          <table className="w-full min-w-[880px] text-left text-[12px]">
            <thead className="border-b border-border/60 bg-secondary/40 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-3 py-2.5 font-medium">Usuario</th>
                <th className="px-3 py-2.5 font-medium">Correo</th>
                <th className="px-3 py-2.5 font-medium">Rol</th>
                <th className="px-3 py-2.5 font-medium">Teléfono</th>
                <th className="px-3 py-2.5 font-medium">Estado</th>
                <th className="px-3 py-2.5 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading &&
                Array.from({ length: 5 }).map((_, indice) => (
                  <tr key={indice}>
                    <td colSpan={6} className="px-3 py-3">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))}

              {!isLoading &&
                usuarios.map((usuario) => (
                  <tr key={usuario.id} className="transition-colors hover:bg-secondary/30">
                    <td className="px-3 py-2.5">
                      <span className="font-medium">
                        {usuario.nombre} {usuario.apellido ?? ''}
                      </span>
                      <span className="num block text-[11px] text-muted-foreground">
                        {usuario.documento ?? 'Sin documento'}
                        {usuario.id === miId ? ' · Tú' : ''}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">{usuario.correo}</td>
                    <td className="px-3 py-2.5">
                      {usuario.rol ? (
                        <Badge variant="neutral">{usuario.rol.nombre}</Badge>
                      ) : (
                        <span className="text-muted-foreground">Sin rol</span>
                      )}
                    </td>
                    <td className="num px-3 py-2.5 text-muted-foreground">
                      {usuario.telefono ?? '—'}
                    </td>
                    <td className="px-3 py-2.5">
                      {usuario.eliminadoEn ? (
                        <Badge variant="danger">Eliminado</Badge>
                      ) : (
                        <Badge variant="entry">Activo</Badge>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        {procesandoId === usuario.id && (
                          <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                        )}
                        {usuario.eliminadoEn ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Restaurar ${usuario.nombre}`}
                            onClick={() => void restaurar(usuario)}
                            disabled={procesandoId !== null}
                          >
                            <RotateCcw className="size-3.5" />
                          </Button>
                        ) : (
                          <>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label={`Editar ${usuario.nombre}`}
                              onClick={() => abrirEdicion(usuario)}
                              disabled={procesandoId !== null}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label={`Restablecer contraseña de ${usuario.nombre}`}
                              onClick={() => abrirReset(usuario)}
                              disabled={procesandoId !== null}
                            >
                              <KeyRound className="size-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label={`Eliminar ${usuario.nombre}`}
                              onClick={() => void eliminar(usuario)}
                              disabled={procesandoId !== null || usuario.id === miId}
                              title={usuario.id === miId ? 'No puedes eliminarte a ti mismo' : undefined}
                            >
                              <Trash2 className="size-3.5 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {!isLoading && usuarios.length === 0 && (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-muted-foreground">
              {isError
                ? 'No fue posible cargar los usuarios.'
                : 'No hay usuarios que coincidan con los filtros.'}
            </p>
            {isError && (
              <Button variant="outline" size="sm" className="mt-4" onClick={() => void refetch()}>
                Reintentar
              </Button>
            )}
          </div>
        )}
      </div>

      {meta && meta.total > 0 && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <span className="num">
            {meta.total} usuario{meta.total === 1 ? '' : 's'} · página {meta.pagina} de{' '}
            {meta.paginas}
          </span>
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.pagina <= 1}
              onClick={() => setPagina((valor) => Math.max(1, valor - 1))}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={meta.pagina >= meta.paginas}
              onClick={() => setPagina((valor) => Math.min(meta.paginas, valor + 1))}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      <UsuarioFormDialog
        abierto={formAbierto}
        onAbiertoChange={setFormAbierto}
        usuario={usuarioEditando}
        roles={roles}
        esPropio={usuarioEditando?.id === miId}
        onGuardado={refrescar}
      />
      <RestablecerContrasenaDialog
        abierto={resetAbierto}
        onAbiertoChange={setResetAbierto}
        usuario={usuarioReset}
        onGuardado={refrescar}
      />
    </div>
  );
}
