# SoGa — Soluciones Garantizadas PS S.A.S.

ERP/CRM ligero y landing corporativa. Monorepo con **NestJS + Prisma + MySQL** (API) y **React + Vite + Tailwind + shadcn/ui** (web).

> Estado actual: **Fase 0 completada** (landing + API de catálogo/contacto + base de datos).
> La autenticación (Better Auth) está instalada pero **aún no cableada**; la pantalla de login es solo UI.

---

## 1. Requisitos

| Herramienta | Versión mínima | Notas |
| --- | --- | --- |
| Node.js | 20 o superior | Probado con Node 24 |
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

El esquema y los datos semilla están en `database/SoGa.sql` (crea la BD `soga`).

**Windows (PowerShell)** — usa UTF-8 para no romper tildes/ñ:

```powershell
Get-Content -Raw -Encoding UTF8 ".\database\SoGa.sql" |
  & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p --default-character-set=utf8mb4
```

**Linux / macOS / Git Bash**:

```bash
mysql -u root -p --default-character-set=utf8mb4 < database/SoGa.sql
```

Alternativa: abre `database/SoGa.sql` en MySQL Workbench y ejecútalo completo.

Verifica que se creó:

```bash
mysql -u root -p -e "USE soga; SHOW TABLES;"
```

Debe listar: `roles`, `users`, `suppliers`, `customers`, `products`, `purchases`, `inventory_movements`, `sales`, `sale_items`, `quotes`, `quote_items`, `messages`, `audit_logs`.

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

## 5. Generar el cliente Prisma y cargar la semilla

```bash
npm run prisma:generate
npm run prisma:seed -w @soga/api
```

`prisma:generate` crea el cliente de Prisma; `prisma:seed` inserta roles, proveedores, clientes y productos de ejemplo (es idempotente: puedes correrlo varias veces).

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
| Landing | http://localhost:5173 |
| Login (UI) | http://localhost:5173/login |
| API | http://localhost:3001/api |
| Catálogo | http://localhost:3001/api/catalogo |
| Destacado | http://localhost:3001/api/destacado |

> Si la API está apagada, la landing igual se muestra usando un catálogo local de respaldo.

---

## 7. Scripts disponibles

Desde `SoGa V1`:

| Comando | Qué hace |
| --- | --- |
| `npm run dev:api` | API en modo watch (puerto 3001) |
| `npm run dev:web` | Web en modo dev (puerto 5173) |
| `npm run build` | Build de API y web |
| `npm run build:api` | Build solo API |
| `npm run build:web` | Build solo web |
| `npm run lint` | Lint del frontend |
| `npm run prisma:generate` | Genera el cliente Prisma |
| `npm run prisma:seed -w @soga/api` | Carga datos semilla |
| `npm run db:push` | Sincroniza el esquema Prisma con la BD (sin migración) |

---

## 8. Estructura del proyecto

```
SoGa V1/
├── apps/
│   ├── api/                    # NestJS 11 + Prisma
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # modelo de datos
│   │   │   └── seed.ts         # datos iniciales
│   │   └── src/
│   │       ├── modules/
│   │       │   ├── catalog/    # GET /api/catalogo, /api/destacado
│   │       │   └── contact/    # POST /api/contacto
│   │       └── prisma/         # PrismaService
│   └── web/                    # React + Vite + Tailwind + shadcn/ui
│       └── src/
│           ├── components/
│           │   ├── landing/    # secciones de la landing
│           │   └── ui/         # primitivos shadcn
│           ├── pages/          # LoginPage
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
Esperado: Better Auth aún no está implementado. La pantalla de login es solo interfaz (Fase 1).

---

## 10. Qué falta (roadmap)

1. **Auth** — Better Auth + `RolesGuard` + proteger `/admin`.
2. **Panel admin** — sidebar/topbar y rutas.
3. **Kardex** — movimientos de inventario (API + tabla de alta densidad).
4. **Módulos** — clientes, proveedores, productos, compras, ventas, cotizaciones, usuarios/roles.
5. **Calidad** — `packages/shared`, tests, Swagger, Pino, CI.
6. **Esquema** — pasar de `SoGa.sql` a migraciones Prisma (`prisma migrate`) cuando cambien tablas.
