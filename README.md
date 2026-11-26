## Módulos Clientes y Usuarios

### Descripción general

Se incorporaron dos módulos al panel administrativo:

- **Clientes**: gestión de la cartera de clientes usada por ventas y cotizaciones.
- **Usuarios**: gestión de cuentas de acceso, roles y estado de los usuarios del sistema.

Ambos siguen el patrón existente del proyecto:

- Backend NestJS + Prisma en `apps/api/src/modules/`.
- Frontend React + TanStack Query en `apps/web/src/`.
- Respuestas con el contrato `{ ok: true, data, meta }`.
- `select` explícito en Prisma (nunca se serializan contraseñas ni hashes).
- Baja lógica mediante `eliminado_en`.
- DTOs con `class-validator` y normalización de entradas.
- `ValidationPipe` global con `whitelist` y `forbidNonWhitelisted`.

No se crearon migraciones: las tablas `clientes`, `usuarios`, `cuentas`, `sesiones` y `roles` ya existían en el esquema.

---

### Módulo Clientes

**Archivos**

    apps/api/src/modules/clientes/{clientes.controller.ts,clientes.service.ts,clientes.module.ts}
    apps/api/src/modules/clientes/dto/cliente.dto.ts
    apps/web/src/pages/AdminClientesPage.tsx
    apps/web/src/components/admin/ClienteFormDialog.tsx

**Endpoints** (prefijo `/api`)

| Método | Ruta | Roles permitidos |
|---|---|---|
| GET | `/clientes?buscar=&pagina=&porPagina=` | Administrador, Vendedor |
| GET | `/clientes/:id` | Administrador, Vendedor |
| POST | `/clientes` | Administrador, Vendedor |
| PATCH | `/clientes/:id` | Administrador, Vendedor |
| DELETE | `/clientes/:id` | Administrador |

**Campos**

`nit` (5–20, único), `nombre` (2–100), `apellido` (opcional), `ciudad` (2–100), `sucursal` (opcional), `direccion` (5–150), `telefono` (7–20), `correo` (email, único).

**Comportamiento**

- Normalización: se recorta el texto de entrada y el correo se guarda en minúsculas.
- Búsqueda por `nombre`, `apellido`, `nit`, `ciudad` o `correo`.
- Paginación con orden estable: `nombre`, `apellido`, `id`. `porPagina` máximo 100.
- El listado y el detalle excluyen los registros dados de baja (`eliminado_en IS NULL`).
- La baja es lógica: marca `eliminado_en` con la fecha actual.
- No se puede eliminar un cliente que tenga **ventas o cotizaciones activas**; el servicio cuenta las relaciones con `eliminadoEn: null` y devuelve `409`.
- Duplicados de NIT se detectan antes del insert y también se captura el código `P2002` de Prisma para devolver `409`.
- Cada fila del listado incluye `_count` de ventas y cotizaciones.

**Ejemplo de alta**

    POST /api/clientes
    {
      "nit": "1065823456",
      "nombre": "Carlos",
      "apellido": "Gómez",
      "ciudad": "Bogotá",
      "sucursal": "Principal",
      "direccion": "Av 68 #95-22",
      "telefono": "3105551234",
      "correo": "carlos.gomez@gmail.com"
    }

**Interfaz**

Ruta `/admin/clientes`. Incluye buscador, paginación, tabla de clientes, diálogo de alta/edición y botón de eliminación (solo para Administrador).

---

### Módulo Usuarios

**Archivos**

    apps/api/src/modules/usuarios/{usuarios.controller.ts,usuarios.service.ts,usuarios.module.ts,roles.controller.ts}
    apps/api/src/modules/usuarios/dto/usuario.dto.ts
    apps/web/src/pages/AdminUsuariosPage.tsx
    apps/web/src/components/admin/UsuarioFormDialog.tsx
    apps/web/src/components/admin/RestablecerContrasenaDialog.tsx

**Endpoints** (prefijo `/api`)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/usuarios?buscar=&rolId=&estado=&pagina=&porPagina=` | Listado paginado |
| GET | `/usuarios/:id` | Detalle de un usuario activo |
| POST | `/usuarios` | Alta de usuario y cuenta de acceso |
| PATCH | `/usuarios/:id` | Edición de datos y rol |
| PATCH | `/usuarios/:id/contrasena` | Restablecimiento de contraseña |
| DELETE | `/usuarios/:id` | Baja lógica |
| POST | `/usuarios/:id/restaurar` | Reactivación de un usuario dado de baja |
| GET | `/roles` | Catálogo de roles para el selector |

Todos los endpoints de este módulo requieren el rol **Administrador**.

**Campos**

`nombre` (2–150), `apellido` (opcional), `documento` (6–20, único, opcional), `telefono` (7–20, opcional), `correo` (email, único), `rolId` (entero positivo), `contrasena` (10–128 caracteres).

**Creación de cuentas**

La contraseña no se guarda en `usuarios`, sino en `cuentas` con `proveedor_id = 'credential'`, usando el mismo esquema que Better Auth:

1. Se valida que el `rolId` exista.
2. Se valida que `correo` y `documento` no estén ocupados (incluidos usuarios dados de baja).
3. Se genera un `hashPassword()` de `better-auth/crypto`.
4. En una sola transacción se crean el `usuario` y su `cuenta` (`cuenta_id = usuario.id`).
5. El usuario creado desde el panel queda con `correo_verificado = true`.

El formulario solo solicita la contraseña al crear. Para cambiarla después se usa el endpoint de restablecimiento.

**Restablecimiento de contraseña**

Reemplaza el hash de la cuenta `credential` (la crea si no existe) y elimina todas las sesiones activas del usuario, de modo que la contraseña anterior deja de ser válida de inmediato.

**Baja, sesiones y restauración**

- `DELETE /usuarios/:id` marca `eliminado_en` y borra las sesiones del usuario.
- `SesionGuard` ya rechaza a cualquier usuario con `eliminado_en != null`, por lo que pierde el
