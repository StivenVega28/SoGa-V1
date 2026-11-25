import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ActualizarProveedorDto,
  CrearProveedorDto,
  ListarProveedoresQuery,
} from './dto/proveedor.dto';

const INCLUDE_PROVEEDOR = {
  _count: {
    select: {
      productos: { where: { eliminadoEn: null } },
      compras: true,
    },
  },
} satisfies Prisma.ProveedorInclude;

type ProveedorConRelaciones = Prisma.ProveedorGetPayload<{ include: typeof INCLUDE_PROVEEDOR }>;

export interface ProveedorSalida {
  id: number;
  nit: string;
  nombre: string;
  ciudad: string;
  direccion: string;
  telefono: string;
  correo: string;
  descripcion: string | null;
  productos: number;
  compras: number;
  creadoEn: Date;
  actualizadoEn: Date;
}

@Injectable()
export class ProveedoresService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(query: ListarProveedoresQuery) {
    const pagina = query.pagina ?? 1;
    const porPagina = query.porPagina ?? 20;

    const where: Prisma.ProveedorWhereInput = {
      eliminadoEn: null,
      ...(query.buscar
        ? {
            OR: [
              { nombre: { contains: query.buscar } },
              { nit: { contains: query.buscar } },
              { ciudad: { contains: query.buscar } },
              { correo: { contains: query.buscar } },
            ],
          }
        : {}),
    };

    const [total, filas] = await this.prisma.$transaction([
      this.prisma.proveedor.count({ where }),
      this.prisma.proveedor.findMany({
        where,
        include: INCLUDE_PROVEEDOR,
        orderBy: { nombre: 'asc' },
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

  async obtener(id: number): Promise<ProveedorSalida> {
    const proveedor = await this.prisma.proveedor.findFirst({
      where: { id, eliminadoEn: null },
      include: INCLUDE_PROVEEDOR,
    });

    if (!proveedor) throw new NotFoundException('Proveedor no encontrado.');
    return this.toSalida(proveedor);
  }

  async crear(dto: CrearProveedorDto): Promise<ProveedorSalida> {
    const existente = await this.prisma.proveedor.findUnique({ where: { nit: dto.nit } });
    if (existente) throw new ConflictException('El NIT ya está registrado.');

    const proveedor = await this.prisma.proveedor.create({
      data: {
        nit: dto.nit.trim(),
        nombre: dto.nombre.trim(),
        ciudad: dto.ciudad.trim(),
        direccion: dto.direccion.trim(),
        telefono: dto.telefono.trim(),
        correo: dto.correo.trim().toLowerCase(),
        descripcion: dto.descripcion?.trim() || null,
      },
      include: INCLUDE_PROVEEDOR,
    });

    return this.toSalida(proveedor);
  }

  async actualizar(id: number, dto: ActualizarProveedorDto): Promise<ProveedorSalida> {
    const actual = await this.prisma.proveedor.findFirst({
      where: { id, eliminadoEn: null },
    });
    if (!actual) throw new NotFoundException('Proveedor no encontrado.');

    if (dto.nit && dto.nit !== actual.nit) {
      const duplicado = await this.prisma.proveedor.findUnique({ where: { nit: dto.nit } });
      if (duplicado) throw new ConflictException('El NIT ya está registrado.');
    }

    const proveedor = await this.prisma.proveedor.update({
      where: { id },
      data: {
        ...(dto.nit !== undefined ? { nit: dto.nit.trim() } : {}),
        ...(dto.nombre !== undefined ? { nombre: dto.nombre.trim() } : {}),
        ...(dto.ciudad !== undefined ? { ciudad: dto.ciudad.trim() } : {}),
        ...(dto.direccion !== undefined ? { direccion: dto.direccion.trim() } : {}),
        ...(dto.telefono !== undefined ? { telefono: dto.telefono.trim() } : {}),
        ...(dto.correo !== undefined ? { correo: dto.correo.trim().toLowerCase() } : {}),
        ...(dto.descripcion !== undefined
          ? { descripcion: dto.descripcion.trim() || null }
          : {}),
      },
      include: INCLUDE_PROVEEDOR,
    });

    return this.toSalida(proveedor);
  }

  async eliminar(id: number): Promise<void> {
    const proveedor = await this.prisma.proveedor.findFirst({
      where: { id, eliminadoEn: null },
      select: {
        id: true,
        _count: {
          select: { productos: { where: { eliminadoEn: null } }, compras: true },
        },
      },
    });

    if (!proveedor) throw new NotFoundException('Proveedor no encontrado.');

    if (proveedor._count.productos > 0) {
      throw new ConflictException(
        'El proveedor tiene productos asociados. Reasígnalos antes de eliminarlo.',
      );
    }

    if (proveedor._count.compras > 0) {
      throw new ConflictException(
        'El proveedor tiene compras registradas. No se puede eliminar.',
      );
    }

    await this.prisma.proveedor.update({
      where: { id },
      data: { eliminadoEn: new Date() },
    });
  }

  private toSalida(proveedor: ProveedorConRelaciones): ProveedorSalida {
    return {
      id: proveedor.id,
      nit: proveedor.nit,
      nombre: proveedor.nombre,
      ciudad: proveedor.ciudad,
      direccion: proveedor.direccion,
      telefono: proveedor.telefono,
      correo: proveedor.correo,
      descripcion: proveedor.descripcion,
      productos: proveedor._count.productos,
      compras: proveedor._count.compras,
      creadoEn: proveedor.creadoEn,
      actualizadoEn: proveedor.actualizadoEn,
    };
  }
}
