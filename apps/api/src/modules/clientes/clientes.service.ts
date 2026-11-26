import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ActualizarClienteDto,
  CrearClienteDto,
  ListarClientesQuery,
} from './dto/cliente.dto';

const SELECT_CLIENTE = {
  id: true,
  nit: true,
  nombre: true,
  apellido: true,
  ciudad: true,
  sucursal: true,
  direccion: true,
  telefono: true,
  correo: true,
  creadoEn: true,
  actualizadoEn: true,
  _count: {
    select: {
      ventas: { where: { eliminadoEn: null } },
      cotizaciones: { where: { eliminadoEn: null } },
    },
  },
} satisfies Prisma.ClienteSelect;

type ClienteConRelaciones = Prisma.ClienteGetPayload<{
  select: typeof SELECT_CLIENTE;
}>;

export interface ClienteSalida {
  id: number;
  nit: string;
  nombre: string;
  apellido: string | null;
  ciudad: string;
  sucursal: string | null;
  direccion: string;
  telefono: string;
  correo: string;
  ventas: number;
  cotizaciones: number;
  creadoEn: Date;
  actualizadoEn: Date;
}

@Injectable()
export class ClientesService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(query: ListarClientesQuery) {
    const pagina = query.pagina ?? 1;
    const porPagina = query.porPagina ?? 20;
    const buscar = query.buscar?.trim();

    const where: Prisma.ClienteWhereInput = {
      eliminadoEn: null,
      ...(buscar
        ? {
            OR: [
              { nombre: { contains: buscar } },
              { apellido: { contains: buscar } },
              { nit: { contains: buscar } },
              { ciudad: { contains: buscar } },
              { correo: { contains: buscar } },
            ],
          }
        : {}),
    };

    const [total, filas] = await this.prisma.$transaction([
      this.prisma.cliente.count({ where }),
      this.prisma.cliente.findMany({
        where,
        select: SELECT_CLIENTE,
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

  async obtener(id: number): Promise<ClienteSalida> {
    const cliente = await this.prisma.cliente.findFirst({
      where: { id, eliminadoEn: null },
      select: SELECT_CLIENTE,
    });

    if (!cliente) throw new NotFoundException('Cliente no encontrado.');
    return this.toSalida(cliente);
  }

  async crear(dto: CrearClienteDto): Promise<ClienteSalida> {
    const existente = await this.prisma.cliente.findUnique({
      where: { nit: dto.nit },
      select: { id: true },
    });
    if (existente) throw new ConflictException('El NIT ya está registrado.');

    try {
      const cliente = await this.prisma.cliente.create({
        data: {
          nit: dto.nit,
          nombre: dto.nombre,
          apellido: dto.apellido || null,
          ciudad: dto.ciudad,
          sucursal: dto.sucursal || null,
          direccion: dto.direccion,
          telefono: dto.telefono,
          correo: dto.correo,
        },
        select: SELECT_CLIENTE,
      });

      return this.toSalida(cliente);
    } catch (error) {
      if (this.esNitDuplicado(error)) {
        throw new ConflictException('El NIT ya está registrado.');
      }
      throw error;
    }
  }

  async actualizar(id: number, dto: ActualizarClienteDto): Promise<ClienteSalida> {
    const actual = await this.prisma.cliente.findFirst({
      where: { id, eliminadoEn: null },
      select: { id: true, nit: true },
    });
    if (!actual) throw new NotFoundException('Cliente no encontrado.');

    if (typeof dto.nit === 'string' && dto.nit !== actual.nit) {
      const duplicado = await this.prisma.cliente.findUnique({
        where: { nit: dto.nit },
        select: { id: true },
      });
      if (duplicado) throw new ConflictException('El NIT ya está registrado.');
    }

    try {
      const cliente = await this.prisma.cliente.update({
        where: { id },
        data: {
          ...(typeof dto.nit === 'string' ? { nit: dto.nit } : {}),
          ...(typeof dto.nombre === 'string' ? { nombre: dto.nombre } : {}),
          ...(typeof dto.apellido === 'string'
            ? { apellido: dto.apellido || null }
            : {}),
          ...(typeof dto.ciudad === 'string' ? { ciudad: dto.ciudad } : {}),
          ...(typeof dto.sucursal === 'string'
            ? { sucursal: dto.sucursal || null }
            : {}),
          ...(typeof dto.direccion === 'string'
            ? { direccion: dto.direccion }
            : {}),
          ...(typeof dto.telefono === 'string' ? { telefono: dto.telefono } : {}),
          ...(typeof dto.correo === 'string' ? { correo: dto.correo } : {}),
        },
        select: SELECT_CLIENTE,
      });

      return this.toSalida(cliente);
    } catch (error) {
      if (this.esNitDuplicado(error)) {
        throw new ConflictException('El NIT ya está registrado.');
      }
      throw error;
    }
  }

  async eliminar(id: number): Promise<void> {
    const cliente = await this.prisma.cliente.findFirst({
      where: { id, eliminadoEn: null },
      select: {
        id: true,
        _count: {
          select: {
            ventas: { where: { eliminadoEn: null } },
            cotizaciones: { where: { eliminadoEn: null } },
          },
        },
      },
    });

    if (!cliente) throw new NotFoundException('Cliente no encontrado.');

    if (cliente._count.ventas > 0) {
      throw new ConflictException(
        'El cliente tiene ventas registradas. No se puede eliminar.',
      );
    }

    if (cliente._count.cotizaciones > 0) {
      throw new ConflictException(
        'El cliente tiene cotizaciones registradas. No se puede eliminar.',
      );
    }

    await this.prisma.cliente.update({
      where: { id },
      data: { eliminadoEn: new Date() },
    });
  }

  private esNitDuplicado(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    );
  }

  private toSalida(cliente: ClienteConRelaciones): ClienteSalida {
    return {
      id: cliente.id,
      nit: cliente.nit,
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      ciudad: cliente.ciudad,
      sucursal: cliente.sucursal,
      direccion: cliente.direccion,
      telefono: cliente.telefono,
      correo: cliente.correo,
      ventas: cliente._count.ventas,
      cotizaciones: cliente._count.cotizaciones,
      creadoEn: cliente.creadoEn,
      actualizadoEn: cliente.actualizadoEn,
    };
  }
}
