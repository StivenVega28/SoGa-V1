-- Categorías y variantes de producto (módulo Productos)

CREATE TABLE `categorias` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `descripcion` VARCHAR(255) NULL,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `categorias_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `categorias` (`nombre`, `descripcion`)
VALUES ('Sillas', 'Sillas para oficina y hogar');

ALTER TABLE `productos`
    ADD COLUMN `categoria_id` INTEGER NULL,
    ADD COLUMN `sku` VARCHAR(40) NULL,
    ADD COLUMN `costo` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `unidad` VARCHAR(20) NOT NULL DEFAULT 'UNIDAD',
    ADD COLUMN `stock_minimo` INTEGER NOT NULL DEFAULT 0;

UPDATE `productos`
SET `categoria_id` = (SELECT `id` FROM `categorias` WHERE `nombre` = 'Sillas' LIMIT 1);

UPDATE `productos`
SET `sku` = CASE `id`
    WHEN 1 THEN 'SILLA-NAIROBI-PRES'
    WHEN 2 THEN 'SILLA-NAIROBI-GER'
    WHEN 3 THEN 'SILLA-BUCAREST'
    WHEN 4 THEN 'SILLA-ATLANTA'
    WHEN 5 THEN 'SILLA-NIZA'
    WHEN 6 THEN 'SILLA-RISMA'
    ELSE CONCAT('PROD-', LPAD(`id`, 4, '0'))
END;

ALTER TABLE `productos`
    MODIFY `categoria_id` INTEGER NOT NULL,
    MODIFY `sku` VARCHAR(40) NOT NULL,
    DROP COLUMN `categoria`;

CREATE UNIQUE INDEX `productos_sku_key` ON `productos`(`sku`);
CREATE INDEX `productos_categoria_id_idx` ON `productos`(`categoria_id`);

ALTER TABLE `productos`
    ADD CONSTRAINT `productos_categoria_id_fkey`
    FOREIGN KEY (`categoria_id`) REFERENCES `categorias`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE `variantes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `producto_id` INTEGER NOT NULL,
    `sku` VARCHAR(60) NOT NULL,
    `nombre` VARCHAR(120) NOT NULL,
    `precio` DECIMAL(12, 2) NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `variantes_sku_key`(`sku`),
    INDEX `variantes_producto_id_idx`(`producto_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `variantes` (`producto_id`, `sku`, `nombre`)
SELECT `id`, CONCAT(`sku`, '-STD'), 'Estándar' FROM `productos`;

ALTER TABLE `variantes`
    ADD CONSTRAINT `variantes_producto_id_fkey`
    FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;
