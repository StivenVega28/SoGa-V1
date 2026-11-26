import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { hashPassword } from 'better-auth/crypto';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ActualizarUsuarioDto,
  CrearUsuarioDto,
  ListarUsuariosQuery,
  RestablecerContrasenaDto,
} from './dto/usuario.dto';

const SELECT_USUARIO = {
  id: true,
  rolId: true,
  documento: true,
  nombre: true,
  apellido: true,
  telefono: true,
  correo: true,
  correoVerificado: true,
  imagen: true,
  eliminadoEn: true,
  creadoEn: true,
  actualizadoEn: true,
  rol: {
    select: {
      id: true,
      nombre: true,
    },
  },
} satisfies Prisma.UsuarioSelect;

type UsuarioConRol = Prisma.UsuarioGetPayload<{
  select: typeof SELECT_USUARIO;
}>;

export interface UsuarioSalida {
  id: string;
  rolId: number | null;
  rol: { id: number; nombre: string } | null;
  documento: string | null;
  nombre: string;
  apellido: string | null;
  telefono: string | null;
  correo: string;
  correoVerificado: boolean;
  imagen: string | null;
  eliminadoEn: Date | null;
  creadoEn: Date;
  actualizadoEn: Date;
}

export interface RolSalida {
  id: number;
  nombre: string;
  descripcion: string;
}

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async listarRoles(): Promise<RolSalida[]> {
    return this.prisma.rol.findMany({
      select: {
        id: true,
        nombre: true,
        descripcion: true,
      },
      orderBy: { id: 'asc' },
    });
  }

  async listar(query: ListarUsuariosQuery) {
    const pagina = query.pagina ?? 1;
    const porPagina = query.porPagina ?? 20;
    const buscar = query.buscar?.trim();
    const verEliminados = query.estado === 'eliminados';

    const where: Prisma.UsuarioWhereInput = {
      eliminadoEn: verEliminados ? { not: null } : null,
      ...(query.rolId ? { rolId: query.rolId } : {}),
      ...(buscar
        ? {
            OR: [
              { nombre: { contains: buscar } },
              { apellido: { contains: buscar } },
              { correo: { contains: buscar } },
              { documento: { contains: buscar } },
            ],
          }
        : {}),
    };

    const [total, filas] = await this.prisma.$transaction([
      this.prisma.usuario.count({ where }),
      this.prisma.usuario.findMany({
        where,
        select: SELECT_USUARIO,
        orderBy: [{ nombre: 'asc' }, { apellido: 'asc' }, { id: 'asc' }],
        skip: (pagina - 1) * porPagina,
        take: porPagina,
      }),
    ]);

    return {
      data: filas.map((fila) => this.toSalida(fila)),
      meta: {
        total,
        pagina,
        porPagina,
        paginas: Math.max(1, Math.ceil(total / porPagina)),
      },
    };
  }

  async obtener(id: string): Promise<UsuarioSalida> {
    const usuario = await this.prisma.usuario.findFirst({
      where: { id, eliminadoEn: null },
      select: SELECT_USUARIO,
    });

    if (!usuario) throw new NotFoundException('Usuario no encontrado.');
    return this.toSalida(usuario);
  }

  async crear(dto: CrearUsuarioDto): Promise<UsuarioSalida> {
    await this.validarRolExiste(dto.rolId);
    await this.validarDisponibilidad({
      correo: dto.correo,
      documento: dto.documento ?? null,
    });

    const hash = await hashPassword(dto.contrasena);
    const id = randomUUID();

    try {
      const creado = await this.prisma.$transaction(async (tx) => {
        const usuario = await tx.usuario.create({
          data: {
            id,
            rolId: dto.rolId,
            documento: dto.documento ?? null,
            nombre: dto.nombre,
            apellido: dto.apellido ?? null,
            telefono: dto.telefono ?? null,
            correo: dto.correo,
            correoVerificado: true,
          },
          select: SELECT_USUARIO,
        });

        await tx.cuenta.create({
          data: {
            id: randomUUID(),
            cuentaId: id,
            proveedorId: 'credential',
            usuarioId: id,
            contrasena: hash,
          },
        });

        return usuario;
      });

      return this.toSalida(creado);
    } catch (error) {
      this.lanzarSiDuplicado(error);
      throw error;
    }
  }

  async actualizar(
    id: string,
    dto: ActualizarUsuarioDto,
    actorId: string,
  ): Promise<UsuarioSalida> {
    const actual = await this.prisma.usuario.findFirst({
      where: { id, eliminadoEn: null },
      select: {
        id: true,
        correo: true,
        documento: true,
        rolId: true,
        rol: { select: { id: true, nombre: true } },
      },
    });
    if (!actual) throw new NotFoundException('Usuario no encontrado.');

    if (dto.rolId !== undefined && dto.rolId !== actual.rolId) {
      const nuevoRol = await this.validarRolExiste(dto.rolId);

      if (actual.rol?.nombre === 'Administrador' && nuevoRol.nombre !== 'Administrador') {
        if (id === actorId) {
          throw new BadRequestException('No puedes quitarte tu propio rol de Administrador.');
        }
        await this.validarNoEsUltimoAdmin();
      }
    }

    await this.validarDisponibilidad({
      correo: dto.correo && dto.correo !== actual.correo ? dto.correo : undefined,
      documento:
        dto.documento !== undefined && dto.documento !== actual.documento
          ? dto.documento
          : undefined,
      excluirId: id,
    });

    try {
      const usuario = await this.prisma.usuario.update({
        where: { id },
        data: {
          ...(dto.nombre !== undefined ? { nombre: dto.nombre } : {}),
          ...(dto.apellido !== undefined ? { apellido: dto.apellido } : {}),
          ...(dto.documento !== undefined ? { documento: dto.documento } : {}),
          ...(dto.telefono !== undefined ? { telefono: dto.telefono } : {}),
          ...(dto.correo !== undefined ? { correo: dto.correo } : {}),
          ...(dto.rolId !== undefined ? { rolId: dto.rolId } : {}),
        },
        select: SELECT_USUARIO,
      });

      return this.toSalida(usuario);
    } catch (error) {
      this.lanzarSiDuplicado(error);
      throw error;
    }
  }

  async restablecerContrasena(id: string, dto: RestablecerContrasenaDto): Promise<void> {
    const usuario = await this.prisma.usuario.findFirst({
      where: { id, eliminadoEn: null },
      select: { id: true },
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado.');

    const hash = await hashPassword(dto.contrasena);

    await this.prisma.$transaction(async (tx) => {
      const cuenta = await tx.cuenta.findFirst({
        where: { usuarioId: id, proveedorId: 'credential' },
        select: { id: true },
      });

      if (cuenta) {
        await tx.cuenta.update({
          where: { id: cuenta.id },
          data: { cuentaId: id, contrasena: hash },
        });
      } else {
        await tx.cuenta.create({
          data: {
            id: randomUUID(),
            cuentaId: id,
            proveedorId: 'credential',
            usuarioId: id,
            contrasena: hash,
          },
        });
      }

      await tx.sesion.deleteMany({ where: { usuarioId: id } });
    });
  }

  async eliminar(id: string, actorId: string): Promise<void> {
    if (id === actorId) {
      throw new BadRequestException('No puedes eliminar tu propio usuario.');
    }

    const usuario = await this.prisma.usuario.findFirst({
      where: { id, eliminadoEn: null },
      select: {
        id: true,
        rol: { select: { nombre: true } },
      },
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado.');

    if (usuario.rol?.nombre === 'Administrador') {
      await this.validarNoEsUltimoAdmin();
    }

    await this.prisma.$transaction([
      this.prisma.usuario.update({
        where: { id },
        data: { eliminadoEn: new Date() },
      }),
      this.prisma.sesion.deleteMany({ where: { usuarioId: id } }),
    ]);
  }

  async restaurar(id: string): Promise<UsuarioSalida> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      select: SELECT_USUARIO,
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado.');
    if (!usuario.eliminadoEn) {
      throw new ConflictException('El usuario ya se encuentra activo.');
    }

    const restaurado = await this.prisma.usuario.update({
      where: { id },
      data: { eliminadoEn: null },
      select: SELECT_USUARIO,
    });

    return this.toSalida(restaurado);
  }

  private async validarRolExiste(rolId: number) {
    const rol = await this.prisma.rol.findUnique({
      where: { id: rolId },
      select: { id: true, nombre: true },
    });
    if (!rol) throw new BadRequestException('El rol seleccionado no existe.');
    return rol;
  }

  private async validarNoEsUltimoAdmin() {
    const totalAdmins = await this.prisma.usuario.count({
      where: {
        eliminadoEn: null,
        rol: { nombre: 'Administrador' },
      },
    });

    if (totalAdmins <= 1) {
      throw new ConflictException('Debe existir al menos un Administrador activo en el sistema.');
    }
  }

  private async validarDisponibilidad(params: {
    correo?: string;
    documento?: string | null;
    excluirId?: string;
  }) {
    if (params.correo) {
      const porCorreo = await this.prisma.usuario.findUnique({
        where: { correo: params.correo },
        select: { id: true, eliminadoEn: true },
      });
      if (porCorreo && porCorreo.id !== params.excluirId) {
        if (porCorreo.eliminadoEn) {
          throw new ConflictException(
            'Existe un usuario eliminado con ese correo. Restáuralo o usa otro correo.',
          );
        }
        throw new ConflictException('El correo ya está registrado.');
      }
    }

    if (params.documento) {
      const porDocumento = await this.prisma.usuario.findUnique({
        where: { documento: params.documento },
        select: { id: true, eliminadoEn: true },
      });
      if (porDocumento && porDocumento.id !== params.excluirId) {
        if (porDocumento.eliminadoEn) {
          throw new ConflictException(
            'Existe un usuario eliminado con ese documento. Restáuralo o usa otro documento.',
          );
        }
        throw new ConflictException('El documento ya está registrado.');
      }
    }
  }

  private lanzarSiDuplicado(error: unknown): void {
    if (
      !(error instanceof Prisma.PrismaClientKnownRequestError) ||
      error.code !== 'P2002'
    ) {
      return;
    }

    const target = String(error.meta?.target ?? '');
    if (target.includes('documento')) {
      throw new ConflictException('El documento ya está registrado.');
    }
    if (target.includes('correo')) {
      throw new ConflictException('El correo ya está registrado.');
    }
    throw new ConflictException('Ya existe un usuario con esos datos.');
  }

  private toSalida(usuario: UsuarioConRol): UsuarioSalida {
    return {
      id: usuario.id,
      rolId: usuario.rolId,
      rol: usuario.rol,
      documento: usuario.documento,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      telefono: usuario.telefono,
      correo: usuario.correo,
      correoVerificado: usuario.correoVerificado,
      imagen: usuario.imagen,
      eliminadoEn: usuario.eliminadoEn,
      creadoEn: usuario.creadoEn,
      actualizadoEn: usuario.actualizadoEn,
    };
  }
}
