# Carta Natal V1 — Release Readiness

## Estado

Código **listo para deploy**.

No listo para declarar producción: falta deploy, env remotas, migrations aplicadas en el proyecto de uso, usuario de Paula, y smoke test real (Gemini + PDFs en el runtime).

## Alcance V1

Uso privado de Paula:

- Home como escritorio de trabajo
- Consultantes: alta, ficha, edición, búsqueda y orden
- Carta Natal (posiciones, aspectos, configuraciones, regentes)
- Generación Gemini (Cristal Paula) con persistencia
- Informe profesional: edición, status draft / reviewed / ready
- Versión consultante y `sourceOutdated`
- PDF profesional y PDF consultante
- Auth email/password + RLS

Fuera de alcance: SaaS, registro público, CRM, dominio custom, analytics, backups custom.

## Uso

Privado — Paula.

Una sola operadora prevista. La URL de producción puede ser la de Vercel. El acceso lo cubre Auth de la aplicación, no un login de hosting.

## Requisitos

- **Supabase:** Auth email/password, auto-registro desactivado, migrations aplicadas, RLS activo, usuario creado a mano. Sin service role en la app.
- **Gemini:** `GEMINI_API_KEY` server-only. SDK `@google/genai`, API v1, Interactions, `store: false`, modelo `gemini-3.6-flash`, Structured Outputs, timeout 300 s.
- **Runtime:** Node 20+, Next.js 16, duración de función 300 s en `/clients/[id]`.
- **Chromium:** `@sparticuz/chromium` + `playwright-core` en Vercel; Chrome/Edge o path local en desarrollo. PDF `maxDuration = 60`.

## Validaciones completadas

- Metodología y contrato de informe (local)
- Flujo real de alta / carta / generación / edición / status / versión consultante
- UX de Home, ficha, workspace e informes
- PDF local (layout/sample); **no** PDF serverless de producción
- Búsqueda y orden de consultantes
- Hardening básico (auth, RLS, logs sin payloads sensibles)
- TypeScript, ESLint, tests de lógica pura, `next build`

## Pendiente antes de declarar producción

- Deploy del hosting
- Variables de entorno en el host
- Migrations remotas verificadas
- Usuario Paula creado; signup público desactivado
- Gemini smoke test en ese runtime
- PDFs profesional y consultante en ese runtime
- Test opcional de RLS con una segunda cuenta, luego borrar
- Confirmar backup/restauración del plan de Supabase

## Auth

- Login: email/password (`/login`)
- No hay pantalla ni Server Action de registro
- Rutas y `/api/*` requieren sesión; si no, redirect a `/login` o 401
- Logout: Header → Cerrar sesión
- Recuperación: dashboard de Supabase Auth (no hay “Forgot password” en V1)

## Known limitations

- PDF y Chromium en serverless **no** están validados hasta el smoke test post-deploy.
- No hay recuperación de contraseña en la UI; se resuelve en el dashboard.
- La búsqueda de consultantes usa `ILIKE`; no hay `unaccent` (sin migración extra).
- No hay paginación en `/clients`; V1 asume un volumen privado razonable (~100–200).
- No hay dominio custom. No hay backups propios de la app.

## Checklist de deploy

1. Crear proyecto Supabase (no desde este prompt).
2. Aplicar las 9 migrations en orden (ver README).
3. Auth: email/password; **desactivar** auto-registro.
4. Crear manualmente el usuario de Paula.
5. Configurar env en el host: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `GEMINI_API_KEY`.
6. Confirmar duración de función ≥ 300 s.
7. Deploy de este repo (sin service role, sin `.env.local`).
8. Smoke test post-deploy (abajo). Todavía no declarar producción.

## Checklist post-deploy

A. Abrir URL de producción sin sesión → login.  
B. Login Paula → Home.  
C. Abrir Consultantes.  
D. Crear un consultante de prueba.  
E. Cargar Carta Natal incluyendo al menos un regente.  
F. Guardar.  
G. Generar análisis Gemini.  
H. Confirmar persistencia del informe.  
I. Editar una parte del informe profesional.  
J. Cambiar status: draft → reviewed → ready.  
K. Preparar versión consultante.  
L. Descargar PDF profesional: responde, descarga, no 500/504, tiempo razonable, contenido, footer, páginas, sin página blanca ni Unicode corrupto.  
M. Descargar PDF consultante: igual.  
N. Verificar historial.  
O. Editar Carta Natal y confirmar el aviso sobre informes previos.  
P. Buscar el consultante desde `/clients`.  
Q. Logout.  
R. Intentar una URL protegida sin sesión.  
S. Login de nuevo y confirmar persistencia.  
T. Eliminar **únicamente** el consultante de prueba.

Opcional: usuario B temporal no debe ver ni abrir consultantes, reports ni PDFs de Paula. Luego eliminar esa cuenta y sus datos.

## Backup

La persistencia está en Supabase/PostgreSQL. Antes del uso sostenido, revisar la política de backups del plan elegido. No hay export ni backup custom en la app.

## Privacidad

Datos guardados: identidad básica del consultante, Carta Natal, informe profesional, versión consultante.

Sin analytics, tracking ni Sentry.
