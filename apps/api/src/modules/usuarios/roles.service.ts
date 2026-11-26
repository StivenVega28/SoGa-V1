import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ActualizarRolDto, CrearRolDto } from './dto/rol.dto';

export interface RolSalida {
  id: number;
  nombre: string;
  descripcion: string;
  permisos: string;
  usuarios: number;
}

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(): Promise<RolSalida[]> {
    const roles = await this.prisma.rol.findMany({
      include: { _count: { select: { usuarios: true } } },
      orderBy: { id: 'asc' },
    });

    return roles.map((rol) => this.toSalida(rol));
  }

  async crear(dto: CrearRolDto): Promise<RolSalida> {
    await this.validarNombreDisponible(dto.nombre);

    const rol = await this.prisma.rol.create({
      data: {
        nombre: dto.nombre,
        descripcion: dto.descripcion ?? '',
        permisos: dto.permisos.join(','),
      },
      include: { _count: { select: { usuarios: true } } },
    });

    return this.toSalida(rol);
  }

  async actualizar(id: number, dto: ActualizarRolDto): Promise<RolSalida> {
    const actual = await this.prisma.rol.findUnique({ where: { id } });
    if (!actual) throw new NotFoundException('Rol no encontrado.');

    if (dto.nombre && dto.nombre !== actual.nombre) {
      await this.validarNombreDisponible(dto.nombre);
    }

    const rol = await this.prisma.rol.update({
      where: { id },
      data: {
        ...(dto.nombre !== undefined ? { nombre: dto.nombre } : {}),
        ...(dto.descripcion !== undefined ? { descripcion: dto.descripcion } : {}),
        ...(dto.permisos !== undefined ? { permisos: dto.permisos.join(',') } : {}),
      },
      include: { _count: { select: { usuarios: true } } },
    });

    return this.toSalida(rol);
  }

  /**
   * Elimina un rol solo si no es el de `Administrador` y no tiene usuarios asignados.
   * Protege la integridad: evita dejar usuarios sin rol o sin un administrador.
   */
  async eliminar(id: number): Promise<void> {
    const rol = await this.prisma.rol.findUnique({
      where: { id },
      include: { _count: { select: { usuarios: true } } },
    });
    if (!rol) throw new NotFoundException('Rol no encontrado.');

    if (rol.nombre === 'Administrador') {
      throw new ConflictException('No se puede eliminar el rol Administrador.');
    }
    if (rol._count.usuarios > 0) {
      throw new ConflictException(
        'El rol tiene usuarios asignados. Reasígnalos antes de eliminarlo.',
      );
    }

    await this.prisma.rol.delete({ where: { id } });
  }

  private async validarNombreDisponible(nombre: string) {
    const existente = await this.prisma.rol.findUnique({ where: { nombre } });
    if (existente) throw new ConflictException('Ya existe un rol con ese nombre.');
  }

  private toSalida(rol: {
    id: number;
    nombre: string;
    descripcion: string;
    permisos: string;
    _count: { usuarios: number };
  }): RolSalida {
    return {
      id: rol.id,
      nombre: rol.nombre,
      descripcion: rol.descripcion,
      permisos: rol.permisos,
      usuarios: rol._count.usuarios,
    };
  }
}
