import 'dotenv/config';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const role = await prisma.role.upsert({
    where: { name: 'Administrador' },
    update: {},
    create: {
      name: 'Administrador',
      permissions: 'todos',
      description: 'Acceso total al sistema y a todos los módulos.',
    },
  });

  const adminEmail = 'admin@soga.com';
  // Password real se gestiona con Better Auth; aquí dejamos un marcador seguro.
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      roleId: role.id,
      document: '1000000001',
      firstName: 'Administrador',
      lastName: 'SoGa',
      phone: '3014333665',
      email: adminEmail,
      passwordHash: 'PENDING_BETTER_AUTH_SETUP',
    },
  });

  const andina = await prisma.supplier.upsert({
    where: { nit: '901201234-5' },
    update: {},
    create: {
      nit: '901201234-5',
      name: 'Distribuidora Andina SAS',
      city: 'Bogotá',
      address: 'Cra 45 #12-34',
      phone: '3001234567',
      email: 'ventas@andina.co',
      description: 'Distribuidor mayorista de productos tecnológicos y de seguridad.',
    },
  });

  const importec = await prisma.supplier.upsert({
    where: { nit: '900987654-3' },
    update: {},
    create: {
      nit: '900987654-3',
      name: 'Importec del Caribe SAS',
      city: 'Barranquilla',
      address: 'Cl 88 #30-10',
      phone: '3012345678',
      email: 'info@importec.co',
      description: 'Importadora de equipos electrónicos y accesorios.',
    },
  });

  const products: Prisma.ProductCreateInput[] = [
    {
      supplier: { connect: { id: andina.id } },
      name: 'Cámara de seguridad HD',
      description: 'Cámara de videovigilancia HD con visión nocturna y app móvil.',
      price: new Prisma.Decimal('149900.00'),
      category: 'Seguridad',
      image: '/img/products/camara-seguridad.svg',
    },
    {
      supplier: { connect: { id: andina.id } },
      name: 'Kit alarma domiciliaria',
      description: 'Kit completo de alarma con sensor de movimiento y control remoto.',
      price: new Prisma.Decimal('289900.00'),
      category: 'Seguridad',
      image: '/img/products/alarma-domiciliaria.svg',
    },
    {
      supplier: { connect: { id: andina.id } },
      name: 'Cerradura inteligente',
      description: 'Cerradura electrónica con acceso por huella, PIN y app.',
      price: new Prisma.Decimal('449900.00'),
      category: 'Hogar',
      image: '/img/products/cerradura-inteligente.svg',
    },
    {
      supplier: { connect: { id: andina.id } },
      name: 'Router WiFi 6',
      description: 'Router de doble banda con tecnología WiFi 6 y cobertura extendida.',
      price: new Prisma.Decimal('199900.00'),
      category: 'Tecnología',
      image: '/img/products/router-wifi6.svg',
    },
    {
      supplier: { connect: { id: importec.id } },
      name: 'Detector de humo',
      description: 'Detector de humo con alerta sonora y notificación móvil.',
      price: new Prisma.Decimal('79900.00'),
      category: 'Seguridad',
      image: '/img/products/detector-humo.svg',
    },
    {
      supplier: { connect: { id: importec.id } },
      name: 'Cargador solar portátil',
      description: 'Cargador solar portátil de 10000 mAh con panel solar integrado.',
      price: new Prisma.Decimal('129900.00'),
      category: 'Tecnología',
      image: '/img/products/cargador-solar.svg',
    },
  ];

  for (const data of products) {
    const existing = await prisma.product.findFirst({ where: { name: data.name } });
    if (!existing) {
      await prisma.product.create({ data });
    }
  }

  // eslint-disable-next-line no-console
  console.log('[Seed] Datos base de SoGa cargados.');
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
