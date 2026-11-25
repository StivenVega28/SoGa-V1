import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ActualizarProductoDto,
  CrearCategoriaDto,
  CrearProductoDto,
  ListarProductosQuery,
  VarianteDto,
} from './dto/producto.dto';

const INCLUDE_PRODUCTO = {
  categoria: true,
  proveedor: true,
  variantes: { orderBy: { id: 'asc' as const } },
} satisfies Prisma.ProductoInclude;

type ProductoConRelaciones = Prisma.ProductoGetPayload<{ include: typeof INCLUDE_PRODUCTO }>;

export interface ProductoSalida {
  id: number;
  sku: string;
  nombre: string;
  descripcion: string;
  precio: string;
  costo: string;
  unidad: string;
  stockMinimo: number;
  categoria: { id: number; nombre: string };
  proveedor: { id: number; nombre: string } | null;
  imagen: string | null;
  imagenes: string[];
  destacado: boolean;
  activo: boolean;
  variantes: Array<{
    id: number;
    sku: string;
    nombre: string;
    precio: string | null;
    activo: boolean;
  }>;
}

@Injectable()
export class ProductosService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(query: ListarProductosQuery) {
    const pagina = query.pagina ?? 1;
    const porPagina = query.porPagina ?? 20;

    const where: Prisma.ProductoWhereInput = {
      eliminadoEn: null,
      ...(query.categoriaId ? { categoriaId: query.categoriaId } : {}),
      ...(query.activo ? { activo: query.activo === 'true' } : {}),
      ...(query.buscar
        ? {
            OR: [
              { nombre: { contains: query.buscar } },
              { sku: { contains: query.buscar } },
            ],
          }
        : {}),
    };

    const [total, filas] = await this.prisma.$transaction([
      this.prisma.producto.count({ where }),
      this.prisma.producto.findMany({
        where,
        include: INCLUDE_PRODUCTO,
        orderBy: [{ nombre: 'asc' }],
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

  async obtener(id: number): Promise<ProductoSalida> {
    const producto = await this.prisma.producto.findFirst({
      where: { id, eliminadoEn: null },
      include: INCLUDE_PRODUCTO,
    });

    if (!producto) throw new NotFoundException('Producto no encontrado.');
    return this.toSalida(producto);
  }

  async crear(dto: CrearProductoDto): Promise<ProductoSalida> {
    await this.validarCategoria(dto.categoriaId);
    if (dto.proveedorId) await this.validarProveedor(dto.proveedorId);

    const duplicado = await this.prisma.producto.findUnique({ where: { sku: dto.sku } });
    if (duplicado) throw new ConflictException('El SKU ya está registrado.');

    this.validarSkusVariantes(dto.variantes ?? []);

    const imagenes = dto.imagenes ?? (dto.imagen ? [dto.imagen] : []);

    const producto = await this.prisma.producto.create({
      data: {
        sku: dto.sku,
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        precio: new Prisma.Decimal(dto.precio),
        costo: new Prisma.Decimal(dto.costo ?? '0'),
        unidad: dto.unidad ?? 'UNIDAD',
        stockMinimo: dto.stockMinimo ?? 0,
        imagen: dto.imagen ?? imagenes[0] ?? null,
        imagenes: imagenes.length > 0 ? imagenes : Prisma.DbNull,
        destacado: dto.destacado ?? false,
        activo: dto.activo ?? true,
        categoria: { connect: { id: dto.categoriaId } },
        proveedor: dto.proveedorId ? { connect: { id: dto.proveedorId } } : undefined,
        variantes: dto.variantes?.length
          ? {
              create: dto.variantes.map((variante) => ({
                sku: variante.sku,
                nombre: variante.nombre,
                precio: variante.precio ? new Prisma.Decimal(variante.precio) : null,
                activo: variante.activo ?? true,
              })),
            }
          : undefined,
      },
      include: INCLUDE_PRODUCTO,
    });

    return this.toSalida(producto);
  }

  async actualizar(id: number, dto: ActualizarProductoDto): Promise<ProductoSalida> {
    const actual = await this.prisma.producto.findFirst({
      where: { id, eliminadoEn: null },
      include: { variantes: true },
    });
    if (!actual) throw new NotFoundException('Producto no encontrado.');

    if (dto.categoriaId) await this.validarCategoria(dto.categoriaId);
    if (dto.proveedorId) await this.validarProveedor(dto.proveedorId);

    if (dto.sku && dto.sku !== actual.sku) {
      const duplicado = await this.prisma.producto.findUnique({ where: { sku: dto.sku } });
      if (duplicado) throw new ConflictException('El SKU ya está registrado.');
    }

    this.validarSkusVariantes(dto.variantes ?? []);

    const imagenes = dto.imagenes;

    const producto = await this.prisma.$transaction(async (tx) => {
      await tx.producto.update({
        where: { id },
        data: {
          ...(dto.sku !== undefined ? { sku: dto.sku } : {}),
          ...(dto.nombre !== undefined ? { nombre: dto.nombre } : {}),
          ...(dto.descripcion !== undefined ? { descripcion: dto.descripcion } : {}),
          ...(dto.precio !== undefined ? { precio: new Prisma.Decimal(dto.precio) } : {}),
          ...(dto.costo !== undefined ? { costo: new Prisma.Decimal(dto.costo) } : {}),
          ...(dto.unidad !== undefined ? { unidad: dto.unidad } : {}),
          ...(dto.stockMinimo !== undefined ? { stockMinimo: dto.stockMinimo } : {}),
          ...(dto.imagen !== undefined ? { imagen: dto.imagen } : {}),
          ...(imagenes !== undefined
            ? { imagenes: imagenes.length > 0 ? imagenes : Prisma.DbNull }
            : {}),
          ...(dto.destacado !== undefined ? { destacado: dto.destacado } : {}),
          ...(dto.activo !== undefined ? { activo: dto.activo } : {}),
          ...(dto.categoriaId !== undefined
            ? { categoria: { connect: { id: dto.categoriaId } } }
            : {}),
          ...(dto.proveedorId !== undefined
            ? dto.proveedorId
              ? { proveedor: { connect: { id: dto.proveedorId } } }
              : { proveedor: { disconnect: true } }
            : {}),
        },
      });

      for (const variante of dto.variantes ?? []) {
        await this.guardarVariante(tx, id, variante, actual.variantes);
      }

      return tx.producto.findUniqueOrThrow({ where: { id }, include: INCLUDE_PRODUCTO });
    });

    return this.toSalida(producto);
  }

  async eliminar(id: number): Promise<void> {
    const producto = await this.prisma.producto.findFirst({
      where: { id, eliminadoEn: null },
      select: {
        id: true,
        _count: {
          select: { compras: true, movimientos: true, itemsVenta: true, itemsCotizacion: true },
        },
      },
    });

    if (!producto) throw new NotFoundException('Producto no encontrado.');

    const referencias =
      producto._count.compras +
      producto._count.movimientos +
      producto._count.itemsVenta +
      producto._count.itemsCotizacion;

    if (referencias > 0) {
      throw new ConflictException(
        'El producto tiene movimientos o documentos asociados. Inactívalo en lugar de eliminarlo.',
      );
    }

    await this.prisma.producto.update({
      where: { id },
      data: { eliminadoEn: new Date(), activo: false },
    });
  }

  async cambiarEstado(id: number, activo: boolean): Promise<ProductoSalida> {
    return this.actualizar(id, { activo });
  }

  async listarCategorias() {
    const categorias = await this.prisma.categoria.findMany({
      include: { _count: { select: { productos: true } } },
      orderBy: { nombre: 'asc' },
    });

    return categorias.map((categoria) => ({
      id: categoria.id,
      nombre: categoria.nombre,
      descripcion: categoria.descripcion,
      productos: categoria._count.productos,
    }));
  }

  async crearCategoria(dto: CrearCategoriaDto) {
    const existente = await this.prisma.categoria.findUnique({ where: { nombre: dto.nombre } });
    if (existente) throw new ConflictException('La categoría ya existe.');

    return this.prisma.categoria.create({
      data: { nombre: dto.nombre, descripcion: dto.descripcion ?? null },
    });
  }

  private async guardarVariante(
    tx: Prisma.TransactionClient,
    productoId: number,
    variante: VarianteDto,
    existentes: Array<{ id: number; sku: string }>,
  ) {
    if (variante.id) {
      const propia = existentes.find((item) => item.id === variante.id);
      if (!propia) throw new BadRequestException('La variante no pertenece a este producto.');

      const duplicado = await tx.variante.findFirst({
        where: { sku: variante.sku, id: { not: variante.id } },
      });
      if (duplicado) throw new ConflictException(`El SKU ${variante.sku} ya está registrado.`);

      await tx.variante.update({
        where: { id: variante.id },
        data: {
          sku: variante.sku,
          nombre: variante.nombre,
          precio: variante.precio ? new Prisma.Decimal(variante.precio) : null,
          ...(variante.activo !== undefined ? { activo: variante.activo } : {}),
        },
      });
      return;
    }

    const duplicado = await tx.variante.findUnique({ where: { sku: variante.sku } });
    if (duplicado) throw new ConflictException(`El SKU ${variante.sku} ya está registrado.`);

    await tx.variante.create({
      data: {
        productoId,
        sku: variante.sku,
        nombre: variante.nombre,
        precio: variante.precio ? new Prisma.Decimal(variante.precio) : null,
        activo: variante.activo ?? true,
      },
    });
  }

  private validarSkusVariantes(variantes: VarianteDto[]) {
    const skus = variantes.map((variante) => variante.sku.toLowerCase());
    if (new Set(skus).size !== skus.length) {
      throw new BadRequestException('Hay SKU de variantes repetidos en la solicitud.');
    }
  }

  private async validarCategoria(categoriaId: number) {
    const categoria = await this.prisma.categoria.findUnique({ where: { id: categoriaId } });
    if (!categoria) throw new BadRequestException('La categoría no existe.');
  }

  private async validarProveedor(proveedorId: number) {
    const proveedor = await this.prisma.proveedor.findFirst({
      where: { id: proveedorId, eliminadoEn: null },
    });
    if (!proveedor) throw new BadRequestException('El proveedor no existe.');
  }

  private toSalida(producto: ProductoConRelaciones): ProductoSalida {
    return {
      id: producto.id,
      sku: producto.sku,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio.toFixed(2),
      costo: producto.costo.toFixed(2),
      unidad: producto.unidad,
      stockMinimo: producto.stockMinimo,
      categoria: { id: producto.categoria.id, nombre: producto.categoria.nombre },
      proveedor: producto.proveedor
        ? { id: producto.proveedor.id, nombre: producto.proveedor.nombre }
        : null,
      imagen: producto.imagen,
      imagenes: this.toImagenes(producto.imagenes, producto.imagen),
      destacado: producto.destacado,
      activo: producto.activo,
      variantes: producto.variantes.map((variante) => ({
        id: variante.id,
        sku: variante.sku,
        nombre: variante.nombre,
        precio: variante.precio ? variante.precio.toFixed(2) : null,
        activo: variante.activo,
      })),
    };
  }

  private toImagenes(imagenes: Prisma.JsonValue, imagen: string | null): string[] {
    if (Array.isArray(imagenes)) {
      const urls = imagenes.filter((valor): valor is string => typeof valor === 'string');
      if (urls.length > 0) return urls;
    }
    return imagen ? [imagen] : [];
  }
}
