# Base de datos

## Desarrollo local

Desde la raiz del monorepo:

```powershell
docker compose up -d
```

Copia `backend/.env.example` a `backend/.env` y usa:

```dotenv
DATABASE_URL=postgresql://foro:cambia-esta-clave@localhost:5432/foro_uni
PG_SSL=false
```

Aplica las migraciones desde `backend`:

```powershell
npm install
npm run db:migrate
```

El runner registra cada archivo aplicado en `schema_migrations` y ejecuta cada
migracion dentro de una transaccion.

## Supabase o PostgreSQL administrado

Configura `DATABASE_URL` con la cadena privada del proveedor y `PG_SSL=true`.
La cadena y las credenciales solo deben existir en el backend, nunca en Vite.
Ejecuta `npm run db:migrate` una vez durante el despliegue antes de iniciar la
API.

## Operacion

Verifica la conectividad con `GET /health`. Haz respaldos antes de migraciones
destructivas y conserva las migraciones aplicadas en control de versiones.