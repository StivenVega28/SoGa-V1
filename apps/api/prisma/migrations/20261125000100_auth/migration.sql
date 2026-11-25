-- DropForeignKey
ALTER TABLE `usuarios` DROP FOREIGN KEY `usuarios_rol_id_fkey`;

-- AlterTable
ALTER TABLE `usuarios` DROP PRIMARY KEY,
    DROP COLUMN `hash_contrasena`,
    ADD COLUMN `imagen` VARCHAR(255) NULL,
    MODIFY `id` VARCHAR(36) NOT NULL,
    MODIFY `rol_id` INTEGER NULL,
    MODIFY `documento` VARCHAR(20) NULL,
    MODIFY `nombre` VARCHAR(150) NOT NULL,
    MODIFY `apellido` VARCHAR(100) NULL,
    ADD PRIMARY KEY (`id`);

-- CreateTable
CREATE TABLE `sesiones` (
    `id` VARCHAR(36) NOT NULL,
    `usuario_id` VARCHAR(36) NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `expira_en` DATETIME(3) NOT NULL,
    `ip` VARCHAR(64) NULL,
    `agente_usuario` VARCHAR(255) NULL,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `sesiones_token_key`(`token`),
    INDEX `sesiones_usuario_id_idx`(`usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cuentas` (
    `id` VARCHAR(36) NOT NULL,
    `cuenta_id` VARCHAR(255) NOT NULL,
    `proveedor_id` VARCHAR(80) NOT NULL,
    `usuario_id` VARCHAR(36) NOT NULL,
    `token_acceso` TEXT NULL,
    `token_refresco` TEXT NULL,
    `token_id` TEXT NULL,
    `expira_acceso_en` DATETIME(3) NULL,
    `expira_refresco_en` DATETIME(3) NULL,
    `alcance` TEXT NULL,
    `contrasena` TEXT NULL,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `cuentas_usuario_id_idx`(`usuario_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `verificaciones` (
    `id` VARCHAR(36) NOT NULL,
    `identificador` VARCHAR(255) NOT NULL,
    `valor` TEXT NOT NULL,
    `expira_en` DATETIME(3) NOT NULL,
    `creado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actualizado_en` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `verificaciones_identificador_idx`(`identificador`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_rol_id_fkey` FOREIGN KEY (`rol_id`) REFERENCES `roles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sesiones` ADD CONSTRAINT `sesiones_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cuentas` ADD CONSTRAINT `cuentas_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

