-- ============================================================
-- SoGa · Soluciones Garantizadas PS S.A.S
-- Precision Ledger · esquema en español (MySQL 8 / Prisma)
-- Dinero = DECIMAL(12,2). Inventario = kardex (movimientos_inventario).
--
-- Snapshot de referencia para una instalación limpia.
-- La fuente de verdad del esquema son las migraciones de Prisma:
--   cd apps/api && npx prisma migrate deploy && npx prisma db seed
--
-- El usuario administrador NO se inserta aquí: `prisma db seed` lo crea
-- con la contraseña hasheada por Better Auth (variable ADMIN_PASSWORD).
-- ============================================================

CREATE DATABASE IF NOT EXISTS soga
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE soga;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS auditoria;
DROP TABLE IF EXISTS mensajes;
DROP TABLE IF EXISTS detalle_cotizaciones;
DROP TABLE IF EXISTS cotizaciones;
DROP TABLE IF EXISTS detalle_ventas;
DROP TABLE IF EXISTS ventas;
DROP TABLE IF EXISTS movimientos_inventario;
DROP TABLE IF EXISTS compras;
DROP TABLE IF EXISTS variantes;
DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS clientes;
DROP TABLE IF EXISTS proveedores;
DROP TABLE IF EXISTS verificaciones;
DROP TABLE IF EXISTS cuentas;
DROP TABLE IF EXISTS sesiones;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS roles;
SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------
-- roles
-- ------------------------------------------------------------
CREATE TABLE roles (
  id             INT           NOT NULL AUTO_INCREMENT,
  nombre         VARCHAR(100)  NOT NULL,
  permisos       TEXT          NOT NULL,
  descripcion    VARCHAR(255)  NOT NULL,
  creado_en      DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  actualizado_en DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY roles_nombre_key (nombre)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- usuarios (modelo de Better Auth + perfil de negocio)
-- ------------------------------------------------------------
CREATE TABLE usuarios (
  id                VARCHAR(36)   NOT NULL,
  rol_id            INT           DEFAULT NULL,
  documento         VARCHAR(20)   DEFAULT NULL,
  nombre            VARCHAR(150)  NOT NULL,
  apellido          VARCHAR(100)  DEFAULT NULL,
  telefono          VARCHAR(20)   DEFAULT NULL,
  correo            VARCHAR(150)  NOT NULL,
  correo_verificado TINYINT(1)    NOT NULL DEFAULT 0,
  imagen            VARCHAR(255)  DEFAULT NULL,
  eliminado_en      DATETIME(3)   DEFAULT NULL,
  creado_en         DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  actualizado_en    DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY usuarios_documento_key (documento),
  UNIQUE KEY usuarios_correo_key (correo),
  KEY usuarios_rol_id_idx (rol_id),
  CONSTRAINT usuarios_rol_id_fkey FOREIGN KEY (rol_id) REFERENCES roles (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- sesiones / cuentas / verificaciones (Better Auth)
-- ------------------------------------------------------------
CREATE TABLE sesiones (
  id             VARCHAR(36)   NOT NULL,
  usuario_id     VARCHAR(36)   NOT NULL,
  token          VARCHAR(255)  NOT NULL,
  expira_en      DATETIME(3)   NOT NULL,
  ip             VARCHAR(64)   DEFAULT NULL,
  agente_usuario VARCHAR(255)  DEFAULT NULL,
  creado_en      DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  actualizado_en DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY sesiones_token_key (token),
  KEY sesiones_usuario_id_idx (usuario_id),
  CONSTRAINT sesiones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE cuentas (
  id                 VARCHAR(36)   NOT NULL,
  cuenta_id          VARCHAR(255)  NOT NULL,
  proveedor_id       VARCHAR(80)   NOT NULL,
  usuario_id         VARCHAR(36)   NOT NULL,
  token_acceso       TEXT          DEFAULT NULL,
  token_refresco     TEXT          DEFAULT NULL,
  token_id           TEXT          DEFAULT NULL,
  expira_acceso_en   DATETIME(3)   DEFAULT NULL,
  expira_refresco_en DATETIME(3)   DEFAULT NULL,
  alcance            TEXT          DEFAULT NULL,
  contrasena         TEXT          DEFAULT NULL,
  creado_en          DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  actualizado_en     DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY cuentas_usuario_id_idx (usuario_id),
  CONSTRAINT cuentas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE verificaciones (
  id             VARCHAR(36)   NOT NULL,
  identificador  VARCHAR(255)  NOT NULL,
  valor          TEXT          NOT NULL,
  expira_en      DATETIME(3)   NOT NULL,
  creado_en      DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  actualizado_en DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY verificaciones_identificador_idx (identificador)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- proveedores
-- ------------------------------------------------------------
CREATE TABLE proveedores (
  id             INT           NOT NULL AUTO_INCREMENT,
  nit            VARCHAR(20)   NOT NULL,
  nombre         VARCHAR(150)  NOT NULL,
  ciudad         VARCHAR(100)  NOT NULL,
  direccion      VARCHAR(150)  NOT NULL,
  telefono       VARCHAR(20)   NOT NULL,
  correo         VARCHAR(150)  NOT NULL,
  descripcion    TEXT          DEFAULT NULL,
  eliminado_en   DATETIME(3)   DEFAULT NULL,
  creado_en      DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  actualizado_en DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY proveedores_nit_key (nit)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- clientes
-- ------------------------------------------------------------
CREATE TABLE clientes (
  id             INT           NOT NULL AUTO_INCREMENT,
  nit            VARCHAR(20)   NOT NULL,
  nombre         VARCHAR(100)  NOT NULL,
  apellido       VARCHAR(100)  DEFAULT NULL,
  ciudad         VARCHAR(100)  NOT NULL,
  sucursal       VARCHAR(100)  DEFAULT NULL,
  direccion      VARCHAR(150)  NOT NULL,
  telefono       VARCHAR(20)   NOT NULL,
  correo         VARCHAR(150)  NOT NULL,
  eliminado_en   DATETIME(3)   DEFAULT NULL,
  creado_en      DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  actualizado_en DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY clientes_nit_key (nit)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- categorias
-- ------------------------------------------------------------
CREATE TABLE categorias (
  id             INT           NOT NULL AUTO_INCREMENT,
  nombre         VARCHAR(100)  NOT NULL,
  descripcion    VARCHAR(255)  DEFAULT NULL,
  creado_en      DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  actualizado_en DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY categorias_nombre_key (nombre)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- productos
-- ------------------------------------------------------------
CREATE TABLE productos (
  id             INT           NOT NULL AUTO_INCREMENT,
  proveedor_id   INT           DEFAULT NULL,
  categoria_id   INT           NOT NULL,
  sku            VARCHAR(40)   NOT NULL,
  nombre         VARCHAR(200)  NOT NULL,
  descripcion    TEXT          NOT NULL,
  precio         DECIMAL(12,2) NOT NULL,
  costo          DECIMAL(12,2) NOT NULL DEFAULT 0,
  unidad         VARCHAR(20)   NOT NULL DEFAULT 'UNIDAD',
  stock_minimo   INT           NOT NULL DEFAULT 0,
  imagen         VARCHAR(255)  DEFAULT NULL,
  imagenes       JSON          DEFAULT NULL,
  destacado      TINYINT(1)    NOT NULL DEFAULT 0,
  activo         TINYINT(1)    NOT NULL DEFAULT 1,
  eliminado_en   DATETIME(3)   DEFAULT NULL,
  creado_en      DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  actualizado_en DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY productos_sku_key (sku),
  KEY productos_proveedor_id_idx (proveedor_id),
  KEY productos_categoria_id_idx (categoria_id),
  CONSTRAINT productos_proveedor_id_fkey FOREIGN KEY (proveedor_id) REFERENCES proveedores (id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT productos_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES categorias (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- variantes (color, tapizado, tamaño…)
-- ------------------------------------------------------------
CREATE TABLE variantes (
  id             INT           NOT NULL AUTO_INCREMENT,
  producto_id    INT           NOT NULL,
  sku            VARCHAR(60)   NOT NULL,
  nombre         VARCHAR(120)  NOT NULL,
  precio         DECIMAL(12,2) DEFAULT NULL,
  activo         TINYINT(1)    NOT NULL DEFAULT 1,
  creado_en      DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  actualizado_en DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY variantes_sku_key (sku),
  KEY variantes_producto_id_idx (producto_id),
  CONSTRAINT variantes_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES productos (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- compras (a proveedor)
-- ------------------------------------------------------------
CREATE TABLE compras (
  id             INT           NOT NULL AUTO_INCREMENT,
  proveedor_id   INT           NOT NULL,
  producto_id    INT           NOT NULL,
  cantidad       INT           NOT NULL,
  costo_unitario DECIMAL(12,2) NOT NULL,
  total          DECIMAL(12,2) NOT NULL,
  comprado_en    DATETIME(3)   NOT NULL,
  creado_en      DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY compras_proveedor_id_idx (proveedor_id),
  KEY compras_producto_id_idx (producto_id),
  CONSTRAINT compras_proveedor_id_fkey FOREIGN KEY (proveedor_id) REFERENCES proveedores (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT compras_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES productos (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- movimientos_inventario (KARDEX: libro de movimientos)
-- El stock se deriva: SUM(entradas) - SUM(salidas) por producto.
-- ------------------------------------------------------------
CREATE TABLE movimientos_inventario (
  id              INT           NOT NULL AUTO_INCREMENT,
  producto_id     INT           NOT NULL,
  tipo            ENUM('ENTRADA','SALIDA','AJUSTE','ANULACION') NOT NULL,
  cantidad        INT           NOT NULL,
  costo_unitario  DECIMAL(12,2) DEFAULT NULL,
  tipo_referencia VARCHAR(40)   DEFAULT NULL,
  referencia_id   INT           DEFAULT NULL,
  nota            VARCHAR(255)  DEFAULT NULL,
  ocurrido_en     DATETIME(3)   NOT NULL,
  creado_en       DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY movimientos_inventario_producto_id_ocurrido_en_idx (producto_id, ocurrido_en),
  KEY movimientos_inventario_tipo_referencia_referencia_id_idx (tipo_referencia, referencia_id),
  CONSTRAINT movimientos_inventario_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES productos (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- ventas
-- ------------------------------------------------------------
CREATE TABLE ventas (
  id             INT           NOT NULL AUTO_INCREMENT,
  cliente_id     INT           NOT NULL,
  emitida_en     DATETIME(3)   NOT NULL,
  subtotal       DECIMAL(12,2) NOT NULL,
  impuesto       DECIMAL(12,2) NOT NULL,
  total          DECIMAL(12,2) NOT NULL,
  estado         ENUM('BORRADOR','CONFIRMADA','ANULADA') NOT NULL DEFAULT 'BORRADOR',
  notas          TEXT          DEFAULT NULL,
  eliminado_en   DATETIME(3)   DEFAULT NULL,
  creado_en      DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  actualizado_en DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY ventas_cliente_id_idx (cliente_id),
  CONSTRAINT ventas_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES clientes (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE detalle_ventas (
  id              INT           NOT NULL AUTO_INCREMENT,
  venta_id        INT           NOT NULL,
  producto_id     INT           NOT NULL,
  cantidad        INT           NOT NULL,
  precio_unitario DECIMAL(12,2) NOT NULL,
  total_linea     DECIMAL(12,2) NOT NULL,
  PRIMARY KEY (id),
  KEY detalle_ventas_venta_id_idx (venta_id),
  KEY detalle_ventas_producto_id_idx (producto_id),
  CONSTRAINT detalle_ventas_venta_id_fkey FOREIGN KEY (venta_id) REFERENCES ventas (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT detalle_ventas_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES productos (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- cotizaciones
-- ------------------------------------------------------------
CREATE TABLE cotizaciones (
  id             INT           NOT NULL AUTO_INCREMENT,
  cliente_id     INT           NOT NULL,
  emitida_en     DATETIME(3)   NOT NULL,
  subtotal       DECIMAL(12,2) NOT NULL,
  impuesto       DECIMAL(12,2) NOT NULL,
  total          DECIMAL(12,2) NOT NULL,
  estado         ENUM('BORRADOR','ENVIADA','ACEPTADA','RECHAZADA') NOT NULL DEFAULT 'BORRADOR',
  eliminado_en   DATETIME(3)   DEFAULT NULL,
  creado_en      DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  actualizado_en DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY cotizaciones_cliente_id_idx (cliente_id),
  CONSTRAINT cotizaciones_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES clientes (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE detalle_cotizaciones (
  id              INT           NOT NULL AUTO_INCREMENT,
  cotizacion_id   INT           NOT NULL,
  producto_id     INT           NOT NULL,
  cantidad        INT           NOT NULL,
  precio_unitario DECIMAL(12,2) NOT NULL,
  total_linea     DECIMAL(12,2) NOT NULL,
  PRIMARY KEY (id),
  KEY detalle_cotizaciones_cotizacion_id_idx (cotizacion_id),
  KEY detalle_cotizaciones_producto_id_idx (producto_id),
  CONSTRAINT detalle_cotizaciones_cotizacion_id_fkey FOREIGN KEY (cotizacion_id) REFERENCES cotizaciones (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT detalle_cotizaciones_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES productos (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- mensajes (contacto de la landing)
-- ------------------------------------------------------------
CREATE TABLE mensajes (
  id        INT           NOT NULL AUTO_INCREMENT,
  nombre    VARCHAR(100)  NOT NULL,
  apellido  VARCHAR(100)  DEFAULT NULL,
  correo    VARCHAR(150)  NOT NULL,
  telefono  VARCHAR(20)   DEFAULT NULL,
  asunto    VARCHAR(150)  NOT NULL,
  mensaje   TEXT          NOT NULL,
  creado_en DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- auditoria
-- ------------------------------------------------------------
CREATE TABLE auditoria (
  id            INT          NOT NULL AUTO_INCREMENT,
  actor_id      INT          DEFAULT NULL,
  accion        VARCHAR(80)  NOT NULL,
  entidad       VARCHAR(80)  NOT NULL,
  entidad_id    INT          DEFAULT NULL,
  datos_antes   TEXT         DEFAULT NULL,
  datos_despues TEXT         DEFAULT NULL,
  creado_en     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY auditoria_entidad_entidad_id_idx (entidad, entidad_id)
) ENGINE=InnoDB;

-- ============================================================
-- DATOS SEMILLA (catálogo; el usuario admin lo crea prisma db seed)
-- ============================================================

INSERT INTO roles (nombre, permisos, descripcion) VALUES
('Administrador', 'todos', 'Acceso total al sistema y a todos los módulos.'),
('Vendedor', 'ventas,cotizaciones,clientes', 'Gestiona clientes, ventas y cotizaciones.'),
('Consultor', 'inventario,productos', 'Puede consultar inventario y productos.');

INSERT INTO proveedores (nit, nombre, ciudad, direccion, telefono, correo, descripcion) VALUES
('901201234-5', 'Distribuidora Andina SAS', 'Bogotá', 'Cra 45 #12-34', '3001234567', 'ventas@andina.co', 'Fabricante y distribuidor de mobiliario para oficina y hogar.'),
('900987654-3', 'Importec del Caribe SAS', 'Barranquilla', 'Cl 88 #30-10', '3012345678', 'info@importec.co', 'Importadora de sillas ergonómicas, accesorios y repuestos.');

INSERT INTO clientes (nit, nombre, apellido, ciudad, sucursal, direccion, telefono, correo) VALUES
('1065823456', 'Carlos', 'Gómez', 'Bogotá', 'Principal', 'Av 68 #95-22', '3105551234', 'carlos.gomez@gmail.com'),
('1030111222', 'María', 'Rodríguez', 'Medellín', 'Sucursal Norte', 'Cl 33 #67-89', '3204445566', 'maria.rodriguez@gmail.com'),
('901712788-9', 'Empresa', 'Ejemplo SAS', 'Bogotá', 'Principal', 'Cra 22 #55-26', '3014333665', 'comercial@solucionesgarantizadas.com');

INSERT INTO categorias (nombre, descripcion) VALUES
('Sillas', 'Sillas para oficina y hogar');

INSERT INTO productos (proveedor_id, categoria_id, sku, nombre, descripcion, precio, costo, unidad, stock_minimo, imagen, imagenes, destacado) VALUES
(1, 1, 'SILLA-NAIROBI-PRES', 'Silla NAIROBI modelo presidente', 'Silla presidencial de espaldar alto con cabecero, tapizada en cuero sintético negro de alta resistencia. Estructura en acero, apoyabrazos acolchados y mecanismo de reclinación con bloqueo en cuatro posiciones. Pistón de gas certificado y base de cinco puntas. Pensada para direcciones y jornadas de trabajo prolongadas.', 1299000.00, 820000.00, 'UNIDAD', 3, '/img/products/silla-nairobi-presidente-1.svg', JSON_ARRAY('/img/products/silla-nairobi-presidente-1.svg','/img/products/silla-nairobi-presidente-2.svg'), 1),
(1, 1, 'SILLA-NAIROBI-GER', 'Silla NAIROBI modelo gerente', 'Silla gerencial de espaldar medio con respaldo en malla transpirable y cojín en espuma de alta densidad. Apoyabrazos regulables, soporte lumbar y mecanismo de balanceo con tensión ajustable. Base de nylon reforzado con rodachinas de uso intensivo.', 899000.00, 560000.00, 'UNIDAD', 4, '/img/products/silla-nairobi-gerente-1.svg', JSON_ARRAY('/img/products/silla-nairobi-gerente-1.svg','/img/products/silla-nairobi-gerente-2.svg'), 0),
(1, 1, 'SILLA-BUCAREST', 'Silla BUCAREST', 'Silla ergonómica tapizada en tela gris con espaldar curvo y cojín de espuma moldeada. Incluye apoyabrazos fijos, regulación de altura y mecanismo de inclinación. Una opción versátil para puestos operativos y salas de trabajo.', 749000.00, 455000.00, 'UNIDAD', 4, '/img/products/silla-bucarest-1.svg', JSON_ARRAY('/img/products/silla-bucarest-1.svg','/img/products/silla-bucarest-2.svg'), 0),
(2, 1, 'SILLA-ATLANTA', 'Silla ATLANTA', 'Silla de visitantes con asiento y espaldar en tela azul, estructura metálica y apoyabrazos fijos. Base de cuatro patas con tapas protectoras para piso. Ideal para salas de espera, recepciones y oficinas de atención.', 549000.00, 330000.00, 'UNIDAD', 6, '/img/products/silla-atlanta-1.svg', JSON_ARRAY('/img/products/silla-atlanta-1.svg','/img/products/silla-atlanta-2.svg'), 0),
(2, 1, 'SILLA-NIZA', 'Silla NIZA', 'Silla operativa con respaldo en malla y asiento en tela negra. Soporte lumbar, apoyabrazos regulables en altura y mecanismo de ajuste de inclinación. Base de cinco puntas con rodachinas para uso diario.', 629000.00, 380000.00, 'UNIDAD', 5, '/img/products/silla-niza-1.svg', JSON_ARRAY('/img/products/silla-niza-1.svg','/img/products/silla-niza-2.svg'), 0),
(2, 1, 'SILLA-RISMA', 'Silla RISMA', 'Silla ergonómica premium tapizada en tela beige, con cabecero y soporte lumbar pronunciado. Base en aluminio pulido, apoyabrazos regulables y mecanismo multibloqueo. Diseñada para máxima comodidad en jornadas largas.', 989000.00, 610000.00, 'UNIDAD', 3, '/img/products/silla-risma-1.svg', JSON_ARRAY('/img/products/silla-risma-1.svg','/img/products/silla-risma-2.svg'), 0);

INSERT INTO variantes (producto_id, sku, nombre) VALUES
(1, 'SILLA-NAIROBI-PRES-STD', 'Negro'),
(2, 'SILLA-NAIROBI-GER-STD', 'Negro'),
(3, 'SILLA-BUCAREST-STD', 'Gris'),
(4, 'SILLA-ATLANTA-STD', 'Azul'),
(5, 'SILLA-NIZA-STD', 'Negro'),
(6, 'SILLA-RISMA-STD', 'Beige');
