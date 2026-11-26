import type { Producto } from './types';

const gallery = (slug: string): string[] => [
  `/img/products/silla-${slug}-1.png`,
  `/img/products/silla-${slug}-2.png`,
];

/**
 * Catálogo de respaldo para cuando la API no está disponible.
 * Se mantiene alineado con `apps/api/prisma/seed.ts`.
 */
export const FALLBACK_CATALOG: Producto[] = [
  {
    id: 1,
    nombre: 'Silla NAIROBI modelo presidente',
    descripcion:
      'Silla presidencial de espaldar alto con cabecero, tapizada en cuero sintético negro de alta resistencia. Estructura en acero, apoyabrazos acolchados y mecanismo de reclinación con bloqueo en cuatro posiciones.',
    categoria: 'Sillas',
    imagenes: gallery('nairobi-presidente'),
    proveedor: 'Distribuidora Andina SAS',
    destacado: true,
  },
  {
    id: 2,
    nombre: 'Silla NAIROBI modelo gerente',
    descripcion:
      'Silla gerencial de espaldar medio con respaldo en malla transpirable y cojín en espuma de alta densidad. Apoyabrazos regulables, soporte lumbar y mecanismo de balanceo con tensión ajustable.',
    categoria: 'Sillas',
    imagenes: gallery('nairobi-gerente'),
    proveedor: 'Distribuidora Andina SAS',
    destacado: false,
  },
  {
    id: 3,
    nombre: 'Silla BUCAREST',
    descripcion:
      'Silla ergonómica tapizada en tela gris con espaldar curvo y cojín de espuma moldeada. Incluye apoyabrazos fijos, regulación de altura y mecanismo de inclinación.',
    categoria: 'Sillas',
    imagenes: gallery('bucarest'),
    proveedor: 'Distribuidora Andina SAS',
    destacado: false,
  },
  {
    id: 4,
    nombre: 'Silla ATLANTA',
    descripcion:
      'Silla de visitantes con asiento y espaldar en tela azul, estructura metálica y apoyabrazos fijos. Base de cuatro patas con tapas protectoras para piso.',
    categoria: 'Sillas',
    imagenes: gallery('atlanta'),
    proveedor: 'Importec del Caribe SAS',
    destacado: false,
  },
  {
    id: 5,
    nombre: 'Silla NIZA',
    descripcion:
      'Silla operativa con respaldo en malla y asiento en tela negra. Soporte lumbar, apoyabrazos regulables en altura y mecanismo de ajuste de inclinación.',
    categoria: 'Sillas',
    imagenes: gallery('niza'),
    proveedor: 'Importec del Caribe SAS',
    destacado: false,
  },
  {
    id: 6,
    nombre: 'Silla RISMA',
    descripcion:
      'Silla ergonómica premium tapizada en tela beige, con cabecero y soporte lumbar pronunciado. Base en aluminio pulido, apoyabrazos regulables y mecanismo multibloqueo.',
    categoria: 'Sillas',
    imagenes: gallery('risma'),
    proveedor: 'Distribuidora Andina SAS',
    destacado: false,
  },
];
