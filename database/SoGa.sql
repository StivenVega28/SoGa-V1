-- ============================================================
-- SoGa · Soluciones Garantizadas PS S.A.S
-- Precision Ledger · esquema corregido (MySQL 8 / Prisma)
-- Dinero = DECIMAL(12,2). Inventario = kardex (movimientos).
-- ============================================================

CREATE DATABASE IF NOT EXISTS soga
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE soga;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS quote_items;
DROP TABLE IF EXISTS quotes;
DROP TABLE IF EXISTS sale_items;
DROP TABLE IF EXISTS sales;
DROP TABLE IF EXISTS inventory_movements;
DROP TABLE IF EXISTS purchases;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS suppliers;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------
-- roles
-- ------------------------------------------------------------
CREATE TABLE roles (
  id           INT           NOT NULL AUTO_INCREMENT,
  name         VARCHAR(100)  NOT NULL,
  permissions  TEXT          NOT NULL,
  description  VARCHAR(255)  NOT NULL,
  created_at   DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at   DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_roles_name (name)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- users
-- ------------------------------------------------------------
CREATE TABLE users (
  id             INT           NOT NULL AUTO_INCREMENT,
  role_id        INT           NOT NULL,
  document       VARCHAR(20)   NOT NULL,
  first_name     VARCHAR(100)  NOT NULL,
  last_name      VARCHAR(100)  NOT NULL,
  phone          VARCHAR(20)   DEFAULT NULL,
  email          VARCHAR(150)  NOT NULL,
  password_hash  VARCHAR(255)  NOT NULL,
  email_verified TINYINT(1)    NOT NULL DEFAULT 0,
  deleted_at     DATETIME(3)   DEFAULT NULL,
  created_at     DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at     DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_document (document),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role (role_id),
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles (id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- suppliers
-- ------------------------------------------------------------
CREATE TABLE suppliers (
  id          INT           NOT NULL AUTO_INCREMENT,
  nit         VARCHAR(20)   NOT NULL,
  name        VARCHAR(150)  NOT NULL,
  city        VARCHAR(100)  NOT NULL,
  address     VARCHAR(150)  NOT NULL,
  phone       VARCHAR(20)   NOT NULL,
  email       VARCHAR(150)  NOT NULL,
  description TEXT          DEFAULT NULL,
  deleted_at  DATETIME(3)   DEFAULT NULL,
  created_at  DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at  DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_suppliers_nit (nit)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- customers
-- ------------------------------------------------------------
CREATE TABLE customers (
  id         INT           NOT NULL AUTO_INCREMENT,
  nit        VARCHAR(20)   NOT NULL,
  first_name VARCHAR(100)  NOT NULL,
  last_name  VARCHAR(100)  DEFAULT NULL,
  city       VARCHAR(100)  NOT NULL,
  branch     VARCHAR(100)  DEFAULT NULL,
  address    VARCHAR(150)  NOT NULL,
  phone      VARCHAR(20)   NOT NULL,
  email      VARCHAR(150)  NOT NULL,
  deleted_at DATETIME(3)   DEFAULT NULL,
  created_at DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_customers_nit (nit)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- products
-- ------------------------------------------------------------
CREATE TABLE products (
  id          INT           NOT NULL AUTO_INCREMENT,
  supplier_id INT           DEFAULT NULL,
  name        VARCHAR(200)  NOT NULL,
  description TEXT          NOT NULL,
  price       DECIMAL(12,2) NOT NULL,
  category    VARCHAR(100)  NOT NULL,
  image       VARCHAR(255)  DEFAULT NULL,
  active      TINYINT(1)    NOT NULL DEFAULT 1,
  deleted_at  DATETIME(3)   DEFAULT NULL,
  created_at  DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at  DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_products_supplier (supplier_id),
  KEY idx_products_category (category),
  CONSTRAINT fk_products_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers (id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- purchases (compras a proveedor)
-- ------------------------------------------------------------
CREATE TABLE purchases (
  id           INT           NOT NULL AUTO_INCREMENT,
  supplier_id  INT           NOT NULL,
  product_id   INT           NOT NULL,
  quantity     INT           NOT NULL,
  unit_cost    DECIMAL(12,2) NOT NULL,
  total        DECIMAL(12,2) NOT NULL,
  purchased_at DATETIME(3)   NOT NULL,
  created_at   DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_purchases_supplier (supplier_id),
  KEY idx_purchases_product (product_id),
  CONSTRAINT fk_purchases_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers (id),
  CONSTRAINT fk_purchases_product  FOREIGN KEY (product_id)  REFERENCES products (id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- inventory_movements (KARDEX: libro de movimientos)
-- El stock se deriva: SUM(entradas) - SUM(salidas) por producto.
-- ------------------------------------------------------------
CREATE TABLE inventory_movements (
  id             INT           NOT NULL AUTO_INCREMENT,
  product_id     INT           NOT NULL,
  type           ENUM('ENTRADA','SALIDA','AJUSTE','ANULACION') NOT NULL,
  quantity       INT           NOT NULL,
  unit_cost      DECIMAL(12,2) DEFAULT NULL,
  reference_type VARCHAR(40)   DEFAULT NULL,
  reference_id   INT           DEFAULT NULL,
  note           VARCHAR(255)  DEFAULT NULL,
  occurred_at    DATETIME(3)   NOT NULL,
  created_at     DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_movements_product_date (product_id, occurred_at),
  KEY idx_movements_reference (reference_type, reference_id),
  CONSTRAINT fk_movements_product FOREIGN KEY (product_id) REFERENCES products (id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- sales
-- ------------------------------------------------------------
CREATE TABLE sales (
  id          INT           NOT NULL AUTO_INCREMENT,
  customer_id INT           NOT NULL,
  issued_at   DATETIME(3)   NOT NULL,
  subtotal    DECIMAL(12,2) NOT NULL,
  tax         DECIMAL(12,2) NOT NULL,
  total       DECIMAL(12,2) NOT NULL,
  status      ENUM('BORRADOR','CONFIRMADA','ANULADA') NOT NULL DEFAULT 'BORRADOR',
  notes       TEXT          DEFAULT NULL,
  deleted_at  DATETIME(3)   DEFAULT NULL,
  created_at  DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at  DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_sales_customer (customer_id),
  CONSTRAINT fk_sales_customer FOREIGN KEY (customer_id) REFERENCES customers (id)
) ENGINE=InnoDB;

CREATE TABLE sale_items (
  id         INT           NOT NULL AUTO_INCREMENT,
  sale_id    INT           NOT NULL,
  product_id INT           NOT NULL,
  quantity   INT           NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  line_total DECIMAL(12,2) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_sale_items_sale (sale_id),
  KEY idx_sale_items_product (product_id),
  CONSTRAINT fk_sale_items_sale    FOREIGN KEY (sale_id)    REFERENCES sales (id) ON DELETE CASCADE,
  CONSTRAINT fk_sale_items_product FOREIGN KEY (product_id) REFERENCES products (id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- quotes
-- ------------------------------------------------------------
CREATE TABLE quotes (
  id          INT           NOT NULL AUTO_INCREMENT,
  customer_id INT           NOT NULL,
  issued_at   DATETIME(3)   NOT NULL,
  subtotal    DECIMAL(12,2) NOT NULL,
  tax         DECIMAL(12,2) NOT NULL,
  total       DECIMAL(12,2) NOT NULL,
  status      ENUM('BORRADOR','ENVIADA','ACEPTADA','RECHAZADA') NOT NULL DEFAULT 'BORRADOR',
  deleted_at  DATETIME(3)   DEFAULT NULL,
  created_at  DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at  DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_quotes_customer (customer_id),
  CONSTRAINT fk_quotes_customer FOREIGN KEY (customer_id) REFERENCES customers (id)
) ENGINE=InnoDB;

CREATE TABLE quote_items (
  id         INT           NOT NULL AUTO_INCREMENT,
  quote_id   INT           NOT NULL,
  product_id INT           NOT NULL,
  quantity   INT           NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  line_total DECIMAL(12,2) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_quote_items_quote (quote_id),
  KEY idx_quote_items_product (product_id),
  CONSTRAINT fk_quote_items_quote   FOREIGN KEY (quote_id)   REFERENCES quotes (id) ON DELETE CASCADE,
  CONSTRAINT fk_quote_items_product FOREIGN KEY (product_id) REFERENCES products (id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- messages (contacto de la landing)
-- ------------------------------------------------------------
CREATE TABLE messages (
  id         INT           NOT NULL AUTO_INCREMENT,
  first_name VARCHAR(100)  NOT NULL,
  last_name  VARCHAR(100)  DEFAULT NULL,
  email      VARCHAR(150)  NOT NULL,
  phone      VARCHAR(20)   DEFAULT NULL,
  subject    VARCHAR(150)  NOT NULL,
  message    TEXT          NOT NULL,
  created_at DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- audit_logs
-- ------------------------------------------------------------
CREATE TABLE audit_logs (
  id         INT          NOT NULL AUTO_INCREMENT,
  actor_id   INT          DEFAULT NULL,
  action     VARCHAR(80)  NOT NULL,
  entity     VARCHAR(80)  NOT NULL,
  entity_id  INT          DEFAULT NULL,
  before_data TEXT        DEFAULT NULL,
  after_data  TEXT        DEFAULT NULL,
  created_at DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY idx_audit_entity (entity, entity_id)
) ENGINE=InnoDB;

-- ============================================================
-- DATOS SEMILLA
-- ============================================================

INSERT INTO roles (name, permissions, description) VALUES
('Administrador', 'todos', 'Acceso total al sistema y a todos los módulos.'),
('Vendedor', 'ventas,cotizaciones,clientes', 'Gestiona clientes, ventas y cotizaciones.'),
('Consultor', 'inventario,productos', 'Puede consultar inventario y productos.');

-- El hash se reemplaza al configurar Better Auth.
INSERT INTO users (role_id, document, first_name, last_name, phone, email, password_hash) VALUES
(1, '1000000001', 'Administrador', 'SoGa', '3014333665', 'admin@soga.com', 'PENDING_BETTER_AUTH_SETUP');

INSERT INTO suppliers (nit, name, city, address, phone, email, description) VALUES
('901201234-5', 'Distribuidora Andina SAS', 'Bogotá', 'Cra 45 #12-34', '3001234567', 'ventas@andina.co', 'Distribuidor mayorista de productos tecnológicos y de seguridad.'),
('900987654-3', 'Importec del Caribe SAS', 'Barranquilla', 'Cl 88 #30-10', '3012345678', 'info@importec.co', 'Importadora de equipos electrónicos y accesorios.');

INSERT INTO customers (nit, first_name, last_name, city, branch, address, phone, email) VALUES
('1065823456', 'Carlos', 'Gómez', 'Bogotá', 'Principal', 'Av 68 #95-22', '3105551234', 'carlos.gomez@gmail.com'),
('1030111222', 'María', 'Rodríguez', 'Medellín', 'Sucursal Norte', 'Cl 33 #67-89', '3204445566', 'maria.rodriguez@gmail.com'),
('901712788-9', 'Empresa', 'Ejemplo SAS', 'Bogotá', 'Principal', 'Cra 22 #55-26', '3014333665', 'comercial@solucionesgarantizadas.com');

INSERT INTO products (supplier_id, name, description, price, category, image) VALUES
(1, 'Cámara de seguridad HD', 'Cámara de videovigilancia HD con visión nocturna y app móvil.', 149900.00, 'Seguridad', '/img/products/camara-seguridad.svg'),
(1, 'Kit alarma domiciliaria', 'Kit completo de alarma con sensor de movimiento y control remoto.', 289900.00, 'Seguridad', '/img/products/alarma-domiciliaria.svg'),
(1, 'Cerradura inteligente', 'Cerradura electrónica con acceso por huella, PIN y app.', 449900.00, 'Hogar', '/img/products/cerradura-inteligente.svg'),
(1, 'Router WiFi 6', 'Router de doble banda con tecnología WiFi 6 y cobertura extendida.', 199900.00, 'Tecnología', '/img/products/router-wifi6.svg'),
(2, 'Detector de humo', 'Detector de humo con alerta sonora y notificación móvil.', 79900.00, 'Seguridad', '/img/products/detector-humo.svg'),
(2, 'Cargador solar portátil', 'Cargador solar portátil de 10000 mAh con panel solar integrado.', 129900.00, 'Tecnología', '/img/products/cargador-solar.svg');

INSERT INTO purchases (supplier_id, product_id, quantity, unit_cost, total, purchased_at) VALUES
(1, 1, 50, 110000.00, 5500000.00, '2026-01-10 00:00:00'),
(1, 2, 30, 233333.33, 7000000.00, '2026-01-12 00:00:00'),
(1, 3, 20, 375000.00, 7500000.00, '2026-01-15 00:00:00'),
(1, 4, 60, 158333.33, 9500000.00, '2026-01-20 00:00:00'),
(2, 5, 100, 60000.00, 6000000.00, '2026-02-01 00:00:00'),
(2, 6, 80, 106250.00, 8500000.00, '2026-02-05 00:00:00');

-- Kardex: entradas iniciales derivadas de las compras
INSERT INTO inventory_movements (product_id, type, quantity, unit_cost, reference_type, reference_id, note, occurred_at) VALUES
(1, 'ENTRADA', 50, 110000.00, 'COMPRA', 1, 'Compra inicial', '2026-01-10 00:00:00'),
(2, 'ENTRADA', 30, 233333.33, 'COMPRA', 2, 'Compra inicial', '2026-01-12 00:00:00'),
(3, 'ENTRADA', 20, 375000.00, 'COMPRA', 3, 'Compra inicial', '2026-01-15 00:00:00'),
(4, 'ENTRADA', 60, 158333.33, 'COMPRA', 4, 'Compra inicial', '2026-01-20 00:00:00'),
(5, 'ENTRADA', 100, 60000.00, 'COMPRA', 5, 'Compra inicial', '2026-02-01 00:00:00'),
(6, 'ENTRADA', 80, 106250.00, 'COMPRA', 6, 'Compra inicial', '2026-02-05 00:00:00');
