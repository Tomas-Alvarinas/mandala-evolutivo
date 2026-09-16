# Mandala Evolutivo

Herramienta **privada** de asistencia profesional para Paula: Carta Natal, Tránsitos y Eclipses, y Revolución Solar.

No es un CRM. No es un SaaS. No hay registro público.

V1 Release Documentation → [docs/V1_RELEASE.md](docs/V1_RELEASE.md)

## Desarrollo local

Requisitos: Node 20+.

1. Copiá `.env.example` a `.env.local` y completá las variables.
2. `npm install`
3. `npm run dev`
4. Abrí [http://localhost:3000](http://localhost:3000)

```bash
npx tsc --noEmit
npx eslint src --max-warnings 0
npm run build
```

Los tests de lógica pura se ejecutan con `npx tsx` sobre los archivos `*.test.ts` en `src/`.

## Deploy privado

Detalle operativo: [docs/v1-release-readiness.md](docs/v1-release-readiness.md).

Mandala Evolutivo V1 está **CLOSED** y en producción (Carta Natal, Tránsitos y Eclipses, Revolución Solar): https://mandala-evolutivo.vercel.app

### Deploy a Vercel (CLI)

`vercel login` deja un OAuth de ~12 h. `vercel link` / Cursor pueden meter `VERCEL_OIDC_TOKEN` en `.env.local` o en la terminal, y también caduca. El primer `vercel --prod` del día falla con `Not authorized` por eso, no por el build.

Una sola vez:

```powershell
npm run deploy:setup
```

Crea un token **Full Account** (no de equipo ni de proyecto) en [vercel.com/account/tokens](https://vercel.com/account/tokens), vencimiento 1 año o sin vencimiento. El script lo guarda en el entorno de usuario de Windows. No lo pegues en `.env.local` ni en el chat. Pegá con clic derecho, no Ctrl+V.

Cada deploy:

```powershell
npm run deploy:prod
```

No uses `vercel --prod` ni `vercel link` en el día a día. `deploy:prod` ignora OIDC vencido, usa el token persistente y el team id del proyecto.

### 1. Prerequisitos

- Node 20+
- Proyecto Supabase (Auth email/password)
- Clave Gemini
- Hosting compatible con Next.js (p. ej. Vercel) y duración de función de **300 s**
- Chromium serverless en ese runtime (`@sparticuz/chromium`)

### 2. Variables de entorno

Requeridas:

- `NEXT_PUBLIC_SUPABASE_URL` — pública por diseño
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — pública por diseño
- `GEMINI_API_KEY` — **solo servidor**

Opcional, solo local:

- `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`

No uses service role. No expongas `GEMINI_API_KEY` al browser.

### 3. Migrations

Fuente de verdad: `supabase/migrations/`, en este orden:

1. `20260826171200_create_clients_and_natal_charts.sql`
2. `20260826214300_add_configuration_points.sql`
3. `20260827160000_update_client_with_natal_chart.sql`
4. `20260827184200_add_natal_house_rulers.sql`
5. `20260827211000_create_natal_chart_reports.sql`
6. `20260827220000_add_generated_report_to_natal_chart_reports.sql`
7. `20260827223000_add_status_to_natal_chart_reports.sql`
8. `20260827234000_create_natal_chart_client_reports.sql`
9. `20260828193200_allow_client_report_source_refresh.sql`
10. `20260901195300_create_transit_analyses.sql`
11. `20260902183000_create_transit_analysis_reports.sql`
12. `20260902191500_add_generated_report_and_status_to_transit_analysis_reports.sql`
13. `20260902200000_create_transit_analysis_client_reports.sql`
14. `20260902210000_allow_transit_client_report_source_refresh.sql`

Aplicarlas en el proyecto remoto **antes** del primer uso. No hay schema duplicado fuera de esas migraciones.

### 4. Cuenta de Paula

1. En Supabase Auth, desactivar el auto-registro público.
2. Crear **manualmente** el usuario de Paula (email/password) desde el dashboard.
3. Compartirle solo la URL de producción. Ella inicia sesión.

No guardar email ni contraseña en este repo.

Recuperación de acceso: no hay “Forgot password” en la app. El administrador resetea o envía una nueva contraseña desde **Supabase Auth → Users**.

### 5. Build

```bash
npm run build
```

### 6. Duración

El hosting debe respetar:

- `/clients/[id]` → `maxDuration = 300` (generación Gemini)
- PDF profesional → `maxDuration = 60`
- PDF consultante → `maxDuration = 60`

En Vercel, confirmar que Fluid compute / el plan elegido permita al menos 300 s.

### 7. Chromium / PDF

- Local: Chrome o Edge instalados, o `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`
- Vercel: `@sparticuz/chromium` + `playwright-core` (runtime Node, no Edge)
- Los PDFs se generan en memoria y se descargan. No se guardan en filesystem ni en Supabase Storage.

Los PDFs profesional y consultante se generan en serverless (Chromium) en producción.

### 8. Checklist post-deploy

Hacerlo en producción, con un consultante de prueba que luego se elimina:

- A. URL sin sesión → `/login`
- B. Login Paula → Home
- C. Abrir Consultantes
- D. Crear un consultante de prueba
- E. Cargar Carta Natal con al menos un regente
- F. Guardar
- G. Generar análisis Gemini
- H. Confirmar persistencia del informe
- I. Editar una parte del informe profesional
- J. Status: draft → reviewed → ready
- K. Preparar versión consultante
- L. Descargar PDF profesional (responde, no 500/504, contenido, footer, páginas)
- M. Descargar PDF consultante (igual)
- N. Verificar historial
- O. Editar Carta Natal y ver el aviso sobre informes previos
- P. Buscar el consultante en `/clients`
- Q. Logout
- R. URL protegida sin sesión → login
- S. Login de nuevo y confirmar persistencia
- T. Eliminar **solo** el consultante de prueba

Opcional, antes de uso sostenido: segunda cuenta temporal para comprobar RLS; luego borrarla. Revisar backups del plan de Supabase.

## Privacidad

Se almacenan en Supabase: datos identificatorios básicos, Carta Natal, informes profesionales y versión consultante.

No hay analytics, tracking ni Sentry.
