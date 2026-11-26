/*
  Warnings:

  - You are about to drop the column `cantidad` on the `compras` table. All the data in the column will be lost.
  - You are about to drop the column `costo_unitario` on the `compras` table. All the data in the column will be lost.
  - You are about to drop the column `producto_id` on the `compras` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `compras` DROP FOREIGN KEY `compras_producto_id_fkey`;

-- DropIndex
DROP INDEX `compras_producto_id_idx` ON `compras`;

-- AlterTable
ALTER TABLE `compras` DROP COLUMN `cantidad`,
    DROP COLUMN `costo_unitario`,
    DROP COLUMN `producto_id`;

-- CreateTable
CREATE TABLE `detalle_compras` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `compra_id` INTEGER NOT NULL,
    `producto_id` INTEGER NOT NULL,
    `cantidad` INTEGER NOT NULL,
    `costo_unitario` DECIMAL(12, 2) NOT NULL,
    `total_linea` DECIMAL(12, 2) NOT NULL,

    INDEX `detalle_compras_compra_id_idx`(`compra_id`),
    INDEX `detalle_compras_producto_id_idx`(`producto_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `detalle_compras` ADD CONSTRAINT `detalle_compras_compra_id_fkey` FOREIGN KEY (`compra_id`) REFERENCES `compras`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detalle_compras` ADD CONSTRAINT `detalle_compras_producto_id_fkey` FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
