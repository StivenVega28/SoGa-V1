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
> productos (categorías y variantes), proveedores, clientes y usuarios (roles y restablecimiento de
> contraseña). Inventario, compras, ventas y cotizaciones están pendientes.
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

**Alternativa:** `database/SoGa.sql` es un snapshot de referencia con el esquema y datos de
ejemplo. Si lo importas, dile a Prisma que la migración inicial ya está aplicada:

```powershell
Get-Content -Raw -Encoding UTF8 ".\database\SoGa.sql" |
  & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p --default-character-set=utf8mb4

npx prisma migrate resolve --applied 20261125000000_init
```

(Ese último comando se ejecuta dentro de `apps/api`.)

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
│   │       │   └── usuarios/   # CRUD de usuarios, roles y contraseñas
│   │       └── prisma/         # PrismaService
│   └── web/                    # React + Vite + Tailwind + shadcn/ui
│       └── src/
│           ├── components/
│           │   ├── admin/      # layout, ruta protegida, formulario de producto
│           │   ├── landing/    # secciones de la landing
│           │   └── ui/         # primitivos shadcn
│           ├── pages/          # Login, panel, productos, clientes y usuarios
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
  o por el futuro módulo de usuarios.
- `SesionGuard` global exige sesión en todas las rutas salvo las marcadas con `@Publico()`.
- `RolesGuard` valida el rol declarado con `@Roles(...)`; sin rol asignado, deniega.
- Roles del seed: `Administrador`, `Vendedor`, `Consultor`.

Rutas públicas: landing, `GET /api/catalogo`, `GET /api/destacado` y `POST /api/contacto`.
Todo lo demás responde `401` sin sesión.

---

## 11. Qué falta (roadmap)

1. **Panel admin** — completar compras, inventario, ventas y cotizaciones.
2. **Kardex** — movimientos de inventario y stock derivado con bloqueo transaccional.
3. **Compras** — cabecera + detalle, entrada de kardex y actualización de costo.
4. **Usuarios y roles** — permisos por módulo y auditoría (el CRUD de usuarios ya está implementado).
5. **Calidad** — `packages/shared`, tests, Swagger, Pino, CI.

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
