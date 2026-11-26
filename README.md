# SoGa — Soluciones Garantizadas PS S.A.S.

ERP/CRM ligero y landing corporativa para una empresa de venta, reparación y mantenimiento de
muebles. Monorepo con API REST y panel administrativo.

## Tecnologías del proyecto

| Capa | Tecnología | Versión | Para qué se usa |
| --- | --- | --- | --- |
| Runtime | Node.js | ≥ 20.19 (probado con 24) | Ejecuta API, builds y scripts |
| Monorepo | npm workspaces | npm 10+ | Agrupa `apps/api` y `apps/web` (`packages/shared` reservado) |
| Lenguaje | TypeScript | 5.6 (modo estricto) | Tipado de todo el proyecto |
| Base de datos | MySQL | 8.0 local / 8.4 Docker | Persistencia relacional en `snake_case` español |
| Backend | NestJS | 11 | API modular con inyección de dependencias |
| ORM | Prisma | 6.19 | Modelos, migraciones versionadas y cliente tipado |
| Autenticación | Better Auth | 1.7 | Login email/contraseña, sesiones en BD, cookies `httpOnly`, rate limit |
| Validación API | class-validator + class-transformer | 0.14 / 0.5 | DTOs, saneamiento y rechazo de campos no permitidos |
| Frontend | React | 18.3 | Interfaz de landing y panel |
| Bundler | Vite | 5.4 | Dev server con HMR y build de producción |
| Rutas | React Router | 6 | Rutas públicas, login y panel protegido |
| Datos cliente | TanStack Query | 5 | Caché, reintentos y estados de carga |
| Estilos | Tailwind CSS | 3.4 | Utilidades y tokens de tema claro/oscuro |
| Componentes | shadcn/ui + Radix UI | — | Primitivos accesibles copiados al repo |
| Iconos | lucide-react | 0.468 | Iconografía de la interfaz |
| Dinero | `DECIMAL(12,2)` + `Prisma.Decimal` | — | Precios y totales sin `float` |
| Calidad | ESLint + Jest + ts-jest | 9 / 29 | Lint y base de pruebas (aún sin tests) |
| Entorno local | Docker Compose | MySQL 8.4 | Base de datos opcional en contenedor |

> **Estado actual:** landing pública, autenticación con Better Auth, panel protegido y módulos de
> productos (categorías y variantes), proveedores, clientes, usuarios, compras, ventas e inventario
> (kardex con stock derivado). Cotizaciones está pendiente.
>
> **Aún no incluido:** Swagger, Pino, pruebas automatizadas, CI y `packages/shared`.

---

## 1. Requisitos

| Herramienta | Versión mínima | Notas |
| --- | --- | --- |
| Node.js | 20.19 o superior | Probado con Node 24 (la semilla importa módulos ESM) |
| npm | 10 o superior | Viene con Node |
| MySQL | 8.0 o superior | Servicio local en `localhost:3306` |
| Git | opcional | Para clonar el repo |

Verifica:

```bash
node -v
npm -v
mysql --version
```

> En Windows, si `mysql` no aparece en el PATH, usa la ruta completa:
> `C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe`

---

## 2. Obtener el proyecto e instalar dependencias

```bash
git clone <url-del-repositorio>
cd "SoGa V1"
npm install
```

`npm install` instala todos los paquetes de `apps/api` y `apps/web` (npm workspaces). Puede tardar varios minutos.

---

## 3. Crear la base de datos

La fuente de verdad del esquema son las **migraciones de Prisma** (`apps/api/prisma/migrations`).
Primero crea la base vacía (Prisma no la crea sola en `migrate deploy`):

```sql
CREATE DATABASE IF NOT EXISTS soga
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p -e "CREATE DATABASE IF NOT EXISTS soga DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Luego aplica las migraciones:

```bash
npm run prisma:deploy
```

**Alternativa:** `database/SoGa.sql` es un snapshot de referencia (generado con `mysqldump`) con el
esquema y los datos de ejemplo. Si lo importas, marca todas las migraciones como aplicadas para que
Prisma no intente recrear las tablas:

```powershell
Get-Content -Raw -Encoding UTF8 ".\database\SoGa.sql" |
  & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p --default-character-set=utf8mb4
```

Dentro de `apps/api`, basalea las migraciones (una por cada carpeta en `prisma/migrations`):

```bash
npx prisma migrate resolve --applied 20261125000000_init
npx prisma migrate resolve --applied 20261125000100_auth
npx prisma migrate resolve --applied 20261125000200_productos
npx prisma migrate resolve --applied 20261126204545_compras_cabecera_detalle
```

Verifica que se creó:

```bash
mysql -u root -p -e "USE soga; SHOW TABLES;"
```

Debe listar: `roles`, `usuarios`, `proveedores`, `clientes`, `productos`, `compras`, `movimientos_inventario`, `ventas`, `detalle_ventas`, `cotizaciones`, `detalle_cotizaciones`, `mensajes`, `auditoria`.

---

## 4. Configurar variables de entorno

Hay **dos** archivos `.env` (no se versionan, contienen secretos):

### 4.1 Raíz del proyecto — `.env`

Copia `.env.example` → `.env` y ajusta la contraseña:

```powershell
Copy-Item .env.example .env
```

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=TU_CLAVE_DE_MYSQL
DB_NAME=soga

API_PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

VITE_API_URL=http://localhost:3001/api

BETTER_AUTH_SECRET=un_secreto_de_al_menos_32_caracteres
BETTER_AUTH_URL=http://localhost:3001

ADMIN_PASSWORD=Soga.Admin2026
```

### 4.2 API — `apps/api/.env`

Copia `apps/api/.env.example` → `apps/api/.env` y ajusta la contraseña:

```powershell
Copy-Item apps/api/.env.example apps/api/.env
```

```env
DATABASE_URL="mysql://root:TU_CLAVE_DE_MYSQL@localhost:3306/soga"
```

> Si la contraseña tiene caracteres especiales (`@`, `:`, `/`, `#`), codifícalos en URL
> (por ejemplo `@` → `%40`). Es la misma clave que en el `.env` raíz.

---

## 5. Cargar la semilla

```bash
npm run prisma:seed -w @soga/api
```

Inserta roles, usuario administrador, proveedores, clientes y productos de ejemplo. Es
idempotente: puedes correrlo varias veces sin duplicar registros.

---

## 6. Ejecutar el proyecto

Se necesitan **dos terminales** abiertas en `SoGa V1`:

```bash
# Terminal 1 — API NestJS
npm run dev:api
```

```bash
# Terminal 2 — Web React (Vite)
npm run dev:web
```

| Servicio | URL |
| --- | --- |
| Landing (pública) | http://localhost:5173 |
| Login | http://localhost:5173/login |
| Panel administrativo | http://localhost:5173/admin |
| Productos | http://localhost:5173/admin/productos |
| Proveedores | http://localhost:5173/admin/proveedores |
| API | http://localhost:3001/api |
| Catálogo | http://localhost:3001/api/catalogo |
| Destacado | http://localhost:3001/api/destacado |

> Solo la landing es pública. `/api/catalogo`, `/api/destacado` y `/api/contacto` no requieren sesión; el resto de rutas responde `401` sin cookie válida.

### Producción en un solo comando

```bash
npm run start:prod
```

Compila API y web, y levanta **un único proceso** en **http://localhost:3001** que sirve la
landing, el panel y la API (`/api`). No necesitas Vite ni dos terminales. Requiere la base de datos
migrada y con semilla (`npm run prisma:deploy` y `npm run prisma:seed -w @soga/api`).

> En modo desarrollo (`npm run dev:web` + `npm run dev:api`) la web usa el proxy de Vite hacia
> `/api`, así que las cookies de sesión funcionan igual que en producción.

> Si la API está apagada, la landing de desarrollo igual se muestra usando un catálogo local de respaldo.

---

## 7. Scripts disponibles

Desde `SoGa V1`:

| Comando | Qué hace |
| --- | --- |
| `npm run dev:api` | API en modo watch (puerto 3001) |
| `npm run dev:web` | Web en modo dev (puerto 5173) |
| `npm run build` | Build de API y web |
| `npm run start:prod` | Build + servidor único en http://localhost:3001 |
| `npm run build:api` | Build solo API |
| `npm run build:web` | Build solo web |
| `npm run lint` | Lint del frontend |
| `npm run prisma:generate` | Genera el cliente Prisma |
| `npm run prisma:deploy` | Aplica migraciones pendientes |
| `npm run prisma:seed -w @soga/api` | Carga datos semilla y crea el admin |
| `npm run db:push` | Sincroniza el esquema Prisma con la BD (sin migración) |

---

## 8. Estructura del proyecto

```
SoGa V1/
├── apps/
│   ├── api/                    # NestJS 11 + Prisma
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # modelo de datos
│   │   │   ├── migrations/     # migraciones versionadas (Prisma Migrate)
│   │   │   └── seed.ts         # datos iniciales
│   │   └── src/
│   │       ├── modules/
│   │       │   ├── auth/       # Better Auth + guards de sesión y roles
│   │       │   ├── catalog/    # GET /api/catalogo, /api/destacado
│   │       │   ├── contact/    # POST /api/contacto
│   │       │   ├── productos/  # CRUD de productos, categorías y variantes
│   │       │   ├── proveedores/ # CRUD de proveedores
│   │       │   ├── clientes/   # CRUD de clientes
│   │       │   ├── usuarios/   # CRUD de usuarios, roles y contraseñas
│   │       │   ├── compras/    # compras (cabecera + detalle) → entrada de kardex
│   │       │   ├── ventas/     # ventas (cabecera + detalle) → salida de kardex
│   │       │   └── inventario/ # stock derivado, kardex y ajustes
│   │       └── prisma/         # PrismaService
│   └── web/                    # React + Vite + Tailwind + shadcn/ui
│       └── src/
│           ├── components/
│           │   ├── admin/      # layout, ruta protegida, formulario de producto
│           │   ├── landing/    # secciones de la landing
│           │   └── ui/         # primitivos shadcn
│           ├── pages/          # Login, panel, productos, clientes, usuarios, compras, ventas e inventario
│           ├── lib/            # api, tipos, utilidades
│           └── styles/         # tokens "Precision Ledger"
├── database/
│   └── SoGa.sql                # esquema + datos semilla
├── docker-compose.yml          # MySQL opcional para Docker
└── package.json                # workspaces
```

---

## 9. Solución de problemas

**`Access denied for user 'root'@'localhost'`**
La contraseña de `DB_PASSWORD` (raíz) y `DATABASE_URL` (api) no coincide con la de MySQL. Actualiza ambas.

**`mysql` no se reconoce como comando**
Usa la ruta completa `C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe` o agrega esa carpeta al PATH.

**Tildes o ñ dañadas en la BD (`C?mara`)**
Reimporta con `--default-character-set=utf8mb4` y, en PowerShell, con `Get-Content -Raw -Encoding UTF8` (como en el paso 3).

**`@prisma/client did not initialize yet`**
Ejecuta `npm run prisma:generate`.

**Puerto ocupado (3001 o 5173)**
Cambia `API_PORT` en `.env`, o cierra el proceso que use el puerto.

**Login no entra**

Credenciales del seed por defecto:

```text
correo:     admin@soga.com
contraseña: Soga.Admin2026
```

Para cambiarlas, define `ADMIN_PASSWORD` antes de ejecutar la semilla y vuelve a correrla. Si ves
"Demasiados intentos", espera un minuto: Better Auth limita a 5 intentos por minuto por IP.

---

## 10. Autenticación y roles

- **Better Auth** con email/contraseña y sesiones en BD (cookie `httpOnly`, `SameSite=Lax`).
- El registro público está deshabilitado (`disableSignUp`): los usuarios internos se crean por seed
  o por el módulo de usuarios.
- `SesionGuard` global exige sesión en todas las rutas salvo las marcadas con `@Publico()`.
- **Permisos por módulo**: cada rol guarda en `permisos` un listado de módulos a los que puede
  acceder (separados por coma). El valor especial `todos` otorga acceso completo.
  - Acceso de **lectura**: `@Permisos('modulo')` en las rutas `GET`.
  - **Mutaciones**: `@Roles('Administrador')` (o `@Roles('Administrador', 'Vendedor')` en ventas y
    clientes), validado por `RolesGuard`.
- Módulos disponibles como permiso: `productos`, `proveedores`, `clientes`, `compras`, `ventas`,
  `inventario`, `usuarios`, `cotizaciones`.
- Roles del seed:
  - `Administrador` → `todos`
  - `Vendedor` → `ventas,cotizaciones,clientes,inventario`
  - `Consultor` → `inventario,productos`

Rutas públicas: landing, `GET /api/catalogo`, `GET /api/destacado` y `POST /api/contacto`.
Todo lo demás responde `401` sin sesión, y sin el permiso del módulo responde `403`.

---

## 11. Qué falta (roadmap)

1. **Cotizaciones** — cabecera + detalle con conversión opcional a venta.
2. **Anulaciones** — anular ventas/compras con movimiento inverso en el kardex.
3. **Auditoría** — registro de cambios en las tablas principales.
4. **Calidad** — `packages/shared`, tests, Swagger, Pino, CI.

---

## 12. Migraciones

El esquema se versiona con Prisma Migrate:

```bash
npm run prisma:migrate -w @soga/api     # crear/aplicar migraciones en desarrollo
npm run prisma:deploy                   # aplicar en otros entornos
```

Si ya tenías la base creada con `database/SoGa.sql`, la migración `init` está marcada como aplicada y las siguientes se aplican encima.

---

## 13. Módulos Clientes y Usuarios

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

`nit` (5–20, único), `nombre` (2–100), `apellido` (opcional), `ciudad` (2–100), `sucursal` (opcional), `direccion` (5–150), `telefono` (7–20), `correo` (email).

**Comportamiento**

- Normalización: se recorta el texto de entrada y el correo se guarda en minúsculas.
- Búsqueda por `nombre`, `apellido`, `nit`, `ciudad` o `correo`.
- Paginación con orden estable: `nombre`, `apellido`, `id`. `porPagina` máximo 100.
- El listado y el detalle excluyen los registros dados de baja (`eliminado_en IS NULL`).
- La baja es lógica: marca `eliminado_en` con la fecha actual.
- No se puede eliminar un cliente que tenga **ventas o cotizaciones activas**; el servicio cuenta las relaciones con `eliminadoEn: null` y devuelve `409`.
- Duplicados de NIT se detectan antes del insert y también se captura el código `P2002` de Prisma para devolver `409`.
- Cada fila del listado incluye `_count` de ventas y cotizaciones.

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
- `SesionGuard` ya rechaza a cualquier usuario con `eliminado_en != null`, por lo que pierde el acceso de inmediato.
- `POST /usuarios/:id/restaurar` reactiva un usuario dado de baja.
- No puedes eliminar tu propio usuario ni quitarte tu propio rol de Administrador.
- Se protege que siempre exista al menos un Administrador activo.

---

## 14. Módulos Compras, Ventas e Inventario

### Modelo de inventario

El stock **no se guarda en `productos`**: se deriva del kardex (`movimientos_inventario`). Cada
operación de compra o venta registra un movimiento con su tipo:

| Tipo | Efecto en stock | Origen |
|---|---|---|
| `ENTRADA` | suma | compra |
| `SALIDA` | resta | venta |
| `AJUSTE` | suma/resta (cantidad con signo) | ajuste manual |

El stock de un producto es la suma algebraica de sus movimientos. Para evitar **sobreventa** bajo
concurrencia, compras y ventas bloquean las filas de producto (`SELECT … FOR UPDATE`) dentro de una
transacción antes de validar y crear los movimientos.

### Módulo Compras

**Archivos**

    apps/api/src/modules/compras/{compras.controller.ts,compras.service.ts,compras.module.ts}
    apps/api/src/modules/compras/dto/compra.dto.ts
    apps/web/src/pages/AdminComprasPage.tsx
    apps/web/src/components/admin/CompraFormDialog.tsx
    apps/web/src/components/admin/CompraDetalleDialog.tsx

**Endpoints** (prefijo `/api`)

| Método | Ruta | Roles |
|---|---|---|
| GET | `/compras?buscar=&proveedorId=&pagina=&porPagina=` | Administrador, Vendedor, Consultor |
| GET | `/compras/:id` | Administrador, Vendedor, Consultor |
| POST | `/compras` | Administrador |

**Comportamiento**

- `Compra` es **cabecera** (`proveedor`, `total`, `comprado_en`) + `DetalleCompra` (producto, cantidad, costo unitario).
- En una sola transacción se crean la compra, sus detalles y un movimiento `ENTRADA` por línea.
- Se actualiza el **costo promedio ponderado** del producto: `(stock_anterior × costo_actual + cantidad × costo_nuevo) / nuevo_stock`.
- Se rechazan productos repetidos en las líneas.

**Ejemplo de alta**

    POST /api/compras
    {
      "proveedorId": 1,
      "items": [
        { "productoId": 1, "cantidad": 10, "costoUnitario": "500000.00" }
      ]
    }

### Módulo Ventas

**Archivos**

    apps/api/src/modules/ventas/{ventas.controller.ts,ventas.service.ts,ventas.module.ts}
    apps/api/src/modules/ventas/dto/venta.dto.ts
    apps/web/src/pages/AdminVentasPage.tsx
    apps/web/src/components/admin/VentaFormDialog.tsx
    apps/web/src/components/admin/VentaDetalleDialog.tsx

**Endpoints** (prefijo `/api`)

| Método | Ruta | Roles |
|---|---|---|
| GET | `/ventas?buscar=&clienteId=&estado=&pagina=&porPagina=` | Administrador, Vendedor, Consultor |
| GET | `/ventas/:id` | Administrador, Vendedor, Consultor |
| POST | `/ventas` | Administrador, Vendedor |

**Comportamiento**

- `Venta` es **cabecera** (`cliente`, `subtotal`, `impuesto`, `total`, `estado`) + `DetalleVenta`.
- Se crea como `CONFIRMADA`: valida que haya stock suficiente por línea y descuenta de inmediato.
- Si el stock es insuficiente devuelve `409` con el detalle del producto y la cantidad disponible.
- `precioUnitario` es opcional por línea; si se omite, se usa el `precio` del producto.
- El movimiento `SALIDA` guarda el `costoUnitario` del producto para el cálculo de costo de venta.

### Módulo Inventario

**Archivos**

    apps/api/src/modules/inventario/{inventario.controller.ts,inventario.service.ts,inventario.module.ts}
    apps/api/src/modules/inventario/dto/inventario.dto.ts
    apps/web/src/pages/AdminInventarioPage.tsx
    apps/web/src/components/admin/{KardexDialog.tsx,AjusteInventarioDialog.tsx}

**Endpoints** (prefijo `/api`)

| Método | Ruta | Roles |
|---|---|---|
| GET | `/inventario?buscar=&pagina=&porPagina=` | Administrador, Vendedor, Consultor |
| GET | `/inventario/:id/movimientos` | Administrador, Vendedor, Consultor |
| POST | `/inventario/ajuste` | Administrador |

**Comportamiento**

- `GET /inventario` lista productos activos con su `stock` derivado, `costo`, `precio` y la marca `bajoMinimo` (stock ≤ stock mínimo).
- `GET /inventario/:id/movimientos` devuelve el kardex de un producto.
- `POST /inventario/ajuste` registra un movimiento `AJUSTE` con cantidad con signo (positiva suma, negativa resta). No permite dejar el stock en negativo.

> Nota: en estos tres módulos el acceso de **lectura** (`GET`) se valida con `@Permisos('modulo')` y
> las **mutaciones** (`POST`/`PATCH`/`DELETE`) con `@Roles(...)`. La tabla anterior muestra los roles
> del seed; un rol personalizado con el permiso del módulo también puede leerlo.

---

## 15. Módulo Roles y permisos

### Descripción

CRUD de roles con permisos estructurados por módulo. Cada rol guarda en `permisos` la lista de
módulos a los que puede acceder, separados por coma (o el valor especial `todos`).

**Archivos**

    apps/api/src/modules/usuarios/roles.service.ts
    apps/api/src/modules/usuarios/roles.controller.ts
    apps/api/src/modules/usuarios/dto/rol.dto.ts
    apps/api/src/modules/auth/permisos.constants.ts
    apps/api/src/modules/auth/decorators/permisos.decorator.ts
    apps/web/src/pages/AdminRolesPage.tsx
    apps/web/src/components/admin/RolFormDialog.tsx

**Endpoints** (prefijo `/api`)

| Método | Ruta | Acceso |
|---|---|---|
| GET | `/roles` | Permiso `usuarios` |
| POST | `/roles` | Rol `Administrador` |
| PATCH | `/roles/:id` | Rol `Administrador` |
| DELETE | `/roles/:id` | Rol `Administrador` |

**Comportamiento**

- `POST /roles` crea un rol con `nombre` (único), `descripcion` y `permisos` (arreglo de módulos).
- Los permisos se validan contra el catálogo fijo (`productos`, `proveedores`, `clientes`,
  `compras`, `ventas`, `inventario`, `usuarios`, `cotizaciones`).
- No se puede eliminar el rol `Administrador` ni un rol que tenga usuarios asignados.
- El menú lateral y el panel de inicio filtran los módulos según los permisos del usuario.

**Categorías**

En la página de productos se agregó un botón **"Nueva categoría"** que crea una categoría desde el
panel (usa el endpoint `POST /api/categorias`, rol `Administrador`).
