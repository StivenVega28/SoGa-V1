import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { PrismaClient, Prisma } from '@prisma/client';
import { hashPassword } from 'better-auth/crypto';

const prisma = new PrismaClient();

type ProductoSemilla = {
  sku: string;
  nombre: string;
  descripcion: string;
  precio: string;
  costo: string;
  stockMinimo: number;
  variante: string;
  proveedorNit: string;
  imagenes: string[];
  destacado?: boolean;
};

const imagenesSilla = (slug: string): string[] => [
  `/img/products/silla-${slug}-1.png`,
  `/img/products/silla-${slug}-2.png`,
];

const PRODUCTOS: ProductoSemilla[] = [
  {
    sku: 'SILLA-NAIROBI-PRES',
    nombre: 'Silla NAIROBI modelo presidente',
    descripcion:
      'Silla presidencial de espaldar alto con cabecero, tapizada en cuero sintético negro de alta resistencia. Estructura en acero, apoyabrazos acolchados y mecanismo de reclinación con bloqueo en cuatro posiciones. Pistón de gas certificado y base de cinco puntas. Pensada para direcciones y jornadas de trabajo prolongadas.',
    precio: '1299000.00',
    costo: '820000.00',
    stockMinimo: 3,
    variante: 'Negro',
    proveedorNit: '901201234-5',
    imagenes: imagenesSilla('nairobi-presidente'),
    destacado: true,
  },
  {
    sku: 'SILLA-NAIROBI-GER',
    nombre: 'Silla NAIROBI modelo gerente',
    descripcion:
      'Silla gerencial de espaldar medio con respaldo en malla transpirable y cojín en espuma de alta densidad. Apoyabrazos regulables, soporte lumbar y mecanismo de balanceo con tensión ajustable. Base de nylon reforzado con rodachinas de uso intensivo.',
    precio: '899000.00',
    costo: '560000.00',
    stockMinimo: 4,
    variante: 'Negro',
    proveedorNit: '901201234-5',
    imagenes: imagenesSilla('nairobi-gerente'),
  },
  {
    sku: 'SILLA-BUCAREST',
    nombre: 'Silla BUCAREST',
    descripcion:
      'Silla ergonómica tapizada en tela gris con espaldar curvo y cojín de espuma moldeada. Incluye apoyabrazos fijos, regulación de altura y mecanismo de inclinación. Una opción versátil para puestos operativos y salas de trabajo.',
    precio: '749000.00',
    costo: '455000.00',
    stockMinimo: 4,
    variante: 'Gris',
    proveedorNit: '901201234-5',
    imagenes: imagenesSilla('bucarest'),
  },
  {
    sku: 'SILLA-ATLANTA',
    nombre: 'Silla ATLANTA',
    descripcion:
      'Silla de visitantes con asiento y espaldar en tela azul, estructura metálica y apoyabrazos fijos. Base de cuatro patas con tapas protectoras para piso. Ideal para salas de espera, recepciones y oficinas de atención.',
    precio: '549000.00',
    costo: '330000.00',
    stockMinimo: 6,
    variante: 'Azul',
    proveedorNit: '900987654-3',
    imagenes: imagenesSilla('atlanta'),
  },
  {
    sku: 'SILLA-NIZA',
    nombre: 'Silla NIZA',
    descripcion:
      'Silla operativa con respaldo en malla y asiento en tela negra. Soporte lumbar, apoyabrazos regulables en altura y mecanismo de ajuste de inclinación. Base de cinco puntas con rodachinas para uso diario.',
    precio: '629000.00',
    costo: '380000.00',
    stockMinimo: 5,
    variante: 'Negro',
    proveedorNit: '900987654-3',
    imagenes: imagenesSilla('niza'),
  },
  {
    sku: 'SILLA-RISMA',
    nombre: 'Silla RISMA',
    descripcion:
      'Silla ergonómica premium tapizada en tela beige, con cabecero y soporte lumbar pronunciado. Base en aluminio pulido, apoyabrazos regulables y mecanismo multibloqueo. Diseñada para máxima comodidad en jornadas largas.',
    precio: '989000.00',
    costo: '610000.00',
    stockMinimo: 3,
    variante: 'Beige',
    proveedorNit: '900987654-3',
    imagenes: imagenesSilla('risma'),
  },
];

async function main() {
  const rol = await prisma.rol.upsert({
    where: { nombre: 'Administrador' },
    update: {
      permisos: 'todos',
      descripcion: 'Acceso total al sistema y a todos los módulos.',
    },
    create: {
      nombre: 'Administrador',
      permisos: 'todos',
      descripcion: 'Acceso total al sistema y a todos los módulos.',
    },
  });

  await prisma.rol.upsert({
    where: { nombre: 'Vendedor' },
    update: {
      permisos: 'ventas,cotizaciones,clientes,inventario',
      descripcion: 'Gestiona clientes, ventas y cotizaciones.',
    },
    create: {
      nombre: 'Vendedor',
      permisos: 'ventas,cotizaciones,clientes,inventario',
      descripcion: 'Gestiona clientes, ventas y cotizaciones.',
    },
  });

  await prisma.rol.upsert({
    where: { nombre: 'Consultor' },
    update: {
      permisos: 'inventario,productos',
      descripcion: 'Puede consultar inventario y productos.',
    },
    create: {
      nombre: 'Consultor',
      permisos: 'inventario,productos',
      descripcion: 'Puede consultar inventario y productos.',
    },
  });

  const correoAdmin = 'admin@soga.com';
  const contrasenaAdmin = process.env.ADMIN_PASSWORD ?? 'Soga.Admin2026';
  const hashAdmin = await hashPassword(contrasenaAdmin);

  const datosAdmin = {
    rolId: rol.id,
    documento: '1000000001',
    nombre: 'Administrador',
    apellido: 'SoGa',
    telefono: '3014333665',
    correoVerificado: true,
    eliminadoEn: null,
  };

  const adminExistente = await prisma.usuario.findUnique({ where: { correo: correoAdmin } });
  const admin = adminExistente
    ? await prisma.usuario.update({ where: { id: adminExistente.id }, data: datosAdmin })
    : await prisma.usuario.create({
        data: { id: randomUUID(), correo: correoAdmin, ...datosAdmin },
      });

  // Better Auth guarda la contraseña en `cuentas` (proveedor "credential").
  const cuentaAdmin = await prisma.cuenta.findFirst({
    where: { usuarioId: admin.id, proveedorId: 'credential' },
  });

  if (cuentaAdmin) {
    await prisma.cuenta.update({
      where: { id: cuentaAdmin.id },
      data: { cuentaId: admin.id, contrasena: hashAdmin },
    });
  } else {
    await prisma.cuenta.create({
      data: {
        id: randomUUID(),
        cuentaId: admin.id,
        proveedorId: 'credential',
        usuarioId: admin.id,
        contrasena: hashAdmin,
      },
    });
  }

  const andina = await prisma.proveedor.upsert({
    where: { nit: '901201234-5' },
    update: {},
    create: {
      nit: '901201234-5',
      nombre: 'Distribuidora Andina SAS',
      ciudad: 'Bogotá',
      direccion: 'Cra 45 #12-34',
      telefono: '3001234567',
      correo: 'ventas@andina.co',
      descripcion: 'Fabricante y distribuidor de mobiliario para oficina y hogar.',
    },
  });

  const importec = await prisma.proveedor.upsert({
    where: { nit: '900987654-3' },
    update: {},
    create: {
      nit: '900987654-3',
      nombre: 'Importec del Caribe SAS',
      ciudad: 'Barranquilla',
      direccion: 'Cl 88 #30-10',
      telefono: '3012345678',
      correo: 'info@importec.co',
      descripcion: 'Importadora de sillas ergonómicas, accesorios y repuestos.',
    },
  });

  const clientes = [
    {
      nit: '1065823456',
      nombre: 'Carlos',
      apellido: 'Gómez',
      ciudad: 'Bogotá',
      sucursal: 'Principal',
      direccion: 'Av 68 #95-22',
      telefono: '3105551234',
      correo: 'carlos.gomez@gmail.com',
    },
    {
      nit: '1030111222',
      nombre: 'María',
      apellido: 'Rodríguez',
      ciudad: 'Medellín',
      sucursal: 'Sucursal Norte',
      direccion: 'Cl 33 #67-89',
      telefono: '3204445566',
      correo: 'maria.rodriguez@gmail.com',
    },
    {
      nit: '901712788-9',
      nombre: 'Empresa',
      apellido: 'Ejemplo SAS',
      ciudad: 'Bogotá',
      sucursal: 'Principal',
      direccion: 'Cra 22 #55-26',
      telefono: '3014333665',
      correo: 'comercial@solucionesgarantizadas.com',
    },
  ];

  for (const cliente of clientes) {
    await prisma.cliente.upsert({
      where: { nit: cliente.nit },
      update: {},
      create: cliente,
    });
  }

  const proveedoresPorNit: Record<string, number> = {
    '901201234-5': andina.id,
    '900987654-3': importec.id,
  };

  const categoria = await prisma.categoria.upsert({
    where: { nombre: 'Sillas' },
    update: {},
    create: { nombre: 'Sillas', descripcion: 'Sillas para oficina y hogar' },
  });

  for (const producto of PRODUCTOS) {
    const datos = {
      sku: producto.sku,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: new Prisma.Decimal(producto.precio),
      costo: new Prisma.Decimal(producto.costo),
      unidad: 'UNIDAD',
      stockMinimo: producto.stockMinimo,
      categoriaId: categoria.id,
      imagen: producto.imagenes[0] ?? null,
      imagenes: producto.imagenes,
      destacado: producto.destacado ?? false,
      activo: true,
      eliminadoEn: null,
      proveedorId: proveedoresPorNit[producto.proveedorNit],
    };

    const existente = await prisma.producto.findFirst({ where: { sku: producto.sku } });
    const guardado = existente
      ? await prisma.producto.update({ where: { id: existente.id }, data: datos })
      : await prisma.producto.create({ data: datos });

    const skuVariante = `${producto.sku}-STD`;
    const variante = await prisma.variante.findUnique({ where: { sku: skuVariante } });
    if (variante) {
      await prisma.variante.update({
        where: { id: variante.id },
        data: { productoId: guardado.id, nombre: producto.variante, activo: true },
      });
    } else {
      await prisma.variante.create({
        data: {
          productoId: guardado.id,
          sku: skuVariante,
          nombre: producto.variante,
        },
      });
    }
  }

  // Un único producto destacado: la silla NAIROBI presidencial.
  await prisma.producto.updateMany({
    where: { sku: { not: 'SILLA-NAIROBI-PRES' } },
    data: { destacado: false },
  });

  // eslint-disable-next-line no-console
  console.log('[Seed] Datos base de SoGa cargados (esquema en español).');
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('[Seed] Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
