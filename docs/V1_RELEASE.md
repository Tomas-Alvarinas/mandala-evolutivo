# Mandala Evolutivo — V1

Status: CLOSED

Release date: 2026-09-09

Production:
https://mandala-evolutivo.vercel.app

Product owner / builder:
Tomás Alvariñas

Domain expert:
Paula

Mandala Evolutivo es una aplicación privada de asistencia profesional que combina una metodología definida por Paula con IA generativa para apoyar la elaboración de análisis de Carta Natal, Tránsitos y Eclipses, y Revolución Solar.

La IA funciona como herramienta de asistencia. Genera una interpretación inicial estructurada a partir de datos astrológicos cargados manualmente.

La interpretación profesional final permanece bajo control humano. Paula revisa, edita, valida y decide qué llega al consultante.

No es un sistema predictivo. No sustituye al profesional.

---

## V1 Scope

V1 incluye tres módulos de análisis, un workflow profesional compartido y PDFs para uso interno y para el consultante.

### Carta Natal

- carga manual de datos astrológicos;
- persistencia del consultante y de la carta;
- generación IA;
- informe profesional editable;
- Original generado inmutable;
- edición profesional;
- estados draft / reviewed / ready;
- versión consultante;
- detección `sourceOutdated`;
- refresh explícito;
- PDF profesional;
- PDF consultante.

### Tránsitos y Eclipses

- carga manual del período;
- posiciones;
- aspectos;
- eclipses;
- integración con Carta Natal;
- generación IA;
- workflow profesional;
- Original generado;
- versión consultante;
- outdated / refresh;
- PDFs;
- historial;
- delete.

### Revolución Solar

- períodos históricos por consultante;
- posiciones RS;
- casas RS;
- overlays natales;
- Ascendente / MC;
- regente del Ascendente manual;
- aspectos internos;
- contactos RS ↔ Natal;
- síntesis manual de elementos;
- integración con Carta Natal;
- generación IA;
- 12 secciones;
- workflow profesional;
- Original generado;
- versión consultante;
- outdated / refresh;
- PDFs;
- historial;
- delete.

---

## Out of Scope

Decisiones de alcance V1, no defectos:

- cálculo automático de carta natal;
- cálculo automático de efemérides;
- cálculo automático de Tránsitos;
- cálculo automático de Revolución Solar;
- descubrimiento automático de aspectos;
- inferencia automática de overlays;
- inferencia automática de regentes;
- predicciones deterministas;
- servicio público multiusuario;
- signup público;
- billing;
- subscriptions;
- roles administrativos complejos;
- colaboración multi-profesional;
- questionnaire / cuestionario de consultante;
- integración automática con fuentes astrológicas externas;
- backups automáticos en Supabase Free;
- aplicación móvil nativa.

---

## Product Principles

### Human in the Loop

Gemini genera una interpretación inicial estructurada.

Paula:

- revisa;
- edita;
- valida;
- decide cuándo está lista;
- controla la versión destinada al consultante.

### Original Preservation

Cada generación conserva un Original generado separado de la versión profesional editable.

Permite:

- trazabilidad;
- comparación;
- revisión de cambios;
- preservar exactamente la salida inicial de IA.

El Original se persiste en `generated_report`. La edición profesional escribe sobre `report`. Un trigger de base de datos impide mutar `generated_report` en actualizaciones normales.

### Professional vs Client Version

Separar:

Original generado → Informe profesional → Versión consultante

La versión consultante no es una nueva generación Gemini.

Es una proyección determinística del informe profesional en estado `ready`. Después puede editarse de forma aislada.

Si el informe profesional cambia después de preparar la versión consultante, `sourceOutdated` queda en true. El refresh es explícito y no llama a Gemini.

### Evidence Grounding

Las bases astrológicas generadas por Gemini deben corresponder a evidencia estructurada permitida por el sistema.

No fuzzy matching. No inventar datos astrológicos.

### Manual Astrology Inputs

La aplicación interpreta relaciones cargadas.

No descubre ni calcula relaciones astrológicas.

---

## Methodology

### Cristal Paula

Existe un núcleo metodológico compartido (`Cristal Paula`) usado como lente de interpretación. No se copian aquí los prompts.

Lentes principales:

- astrología evolutiva;
- psicopedagogía;
- neurociencias / neuroplasticidad;
- teoría polivagal;
- reprogramación mental;
- metafísica;
- inquiry inspirado en Byron Katie;
- trabajo de identidad inspirado en Joe Dispenza;
- arteterapia / Mandala Evolutivo;
- astrología sistémica;
- astrogenealogía.

Secuencia conceptual:

Symbol → Hypothesis → Possible Pattern → Experience → Protective Response → Inner Dialogue → Belief → Resource → Intervention → New Possibility → Symbolic Integration

Separación mantenida:

SYMBOL → HYPOTHESIS → INTERVENTION

Safeguards:

- no determinismo;
- no diagnóstico médico;
- no invención de historia familiar;
- systemic / astrogenealogy solo exploratorio y simbólico;
- protección especial para menores;
- vocación exploratoria, no determinista;
- dinero sin predicción financiera ni asesoramiento;
- autores como orientación interna, no evidencia bibliográfica;
- no inventar teorías, citas, conceptos o atribuciones.

---

## Methodology and Report Versions

Valores leídos del código (source of truth):

| Módulo | Methodology version | Report version | Constante methodology | Constante report |
| --- | --- | --- | --- | --- |
| Carta Natal | 1.3 | 1.1 | `PAULA_LENS_VERSION` | `NATAL_CHART_REPORT_VERSION` |
| Tránsitos y Eclipses | 1.1 | 1.0 | `TRANSIT_METHODOLOGY_VERSION` | `TRANSIT_ANALYSIS_REPORT_VERSION` |
| Revolución Solar | 1.0 | 1.0 | `SOLAR_RETURN_METHODOLOGY_VERSION` | `SOLAR_RETURN_REPORT_VERSION` |

Natal no define una constante llamada `NATAL_METHODOLOGY_VERSION`. La versión metodológica persistida y usada en generación es `PAULA_LENS_VERSION` (`Cristal Paula`).

La versión consultante natal tiene además `NATAL_CHART_CLIENT_REPORT_VERSION = "1.0"` (proyección, no metodología Gemini).

---

## Solar Return Methodology

Módulo validado con Paula sobre una generación real, sin correcciones metodológicas solicitadas.

### Core interpretation

Revolución Solar:

- período de cumpleaños a próximo cumpleaños;
- siempre interpretada en relación con Carta Natal;
- Natal funciona como matriz base;
- no mezcla Tránsitos actuales en V1;
- interpretación anual orientativa, no predictiva.

### Interpretive hierarchy

Ascendente RS + overlay natal
→ regente del Ascendente + aspectos
→ Sol
→ Luna
→ planetas personales
→ contactos RS ↔ Natal significativos
→ concentraciones / elementos
→ síntesis anual.

### Solar Return report

Doce secciones canónicas (`SOLAR_RETURN_REPORT_SECTION_IDS` / `SOLAR_RETURN_REPORT_SECTION_LABELS`):

| ID | Título |
| --- | --- |
| `annualTheme` | Tema central del año |
| `solarAscendant` | Ascendente del año y área natal activada |
| `ascendantRuler` | Regente del Ascendente |
| `sunDirection` | Sol y dirección del año |
| `emotionalWorld` | Mundo emocional y necesidades del año |
| `personalPlanets` | Planetas personales y dinámica cotidiana |
| `energyConcentration` | Concentración de energía y síntesis de elementos |
| `lifeAreas` | Áreas de vida destacadas |
| `evolutionaryChallenges` | Desafíos evolutivos |
| `opportunities` | Oportunidades y áreas favorables |
| `learnings` | Aprendizajes del año |
| `evolutionarySynthesis` | Síntesis evolutiva del año |

Cada sección profesional contiene:

- `content`
- `astrologicalBasis`

La versión consultante proyecta los 12 contenidos y no incluye `astrologicalBasis`.

---

## AI Architecture

Provider: Google Gemini

SDK: `@google/genai` (^2.19.0)

API pattern: Interactions API (`client.interactions.create`, API v1)

Generation: server-side only

`store`: false

Output: Structured Outputs (`response_format` JSON schema)

Validation: Zod + evidence whitelist

API key: `GEMINI_API_KEY` (server-only environment variable)

Modelo actual (los tres módulos): `gemini-3.6-flash`

La constante se llama `GEMINI_NATAL_CHART_MODEL` y es la usada también por Tránsitos y Revolución Solar.

Timeout de red: 300_000 ms.

Flujo general:

Browser
→ IDs mínimos
→ Server Action
→ reload authoritative data
→ ownership / guards
→ build context
→ build evidence whitelist
→ Gemini
→ Structured Output
→ Zod parse
→ evidence validation
→ canonical report
→ persistence (`generated_report` + `report`, status `draft`)

---

## Data and Security

- Supabase PostgreSQL;
- Supabase Auth;
- email / password;
- signup público deshabilitado (no hay registro en la UI; el usuario de Paula se crea a mano);
- RLS por owner;
- `clients.user_id = auth.uid()`;
- ownership de entidades hijas derivado del consultante;
- SECURITY INVOKER en RPCs de refresh de versión consultante;
- no service role en la aplicación;
- Gemini API key solo en servidor;
- Paula como usuaria profesional de V1.

Este documento no incluye emails, user IDs, project secrets, API keys ni passwords.

---

## Production Architecture

Frontend / server: Next.js 16.3.3 (React 19)

Hosting: Vercel

Database / Auth: Supabase

AI: Google Gemini

PDF:

- HTML / CSS
- Playwright (`playwright-core`)
- `@sparticuz/chromium`
- `pdf-lib`

Production URL: https://mandala-evolutivo.vercel.app

Los PDFs se renderizan server-side con Chromium serverless compatible con Vercel.

---

## Core Data Entities

### Clients

Consultante: datos personales, notas profesionales, ownership (`user_id`).

### Natal Charts

Carta natal cargada a mano: posiciones, ángulos, aspectos, configuraciones, regentes de casas.

### Natal Reports

Informe profesional natal: `report` editable, `generated_report` original, status, versiones.

### Natal Client Reports

Versión consultante natal: `source_report` (snapshot del profesional) + `client_report` proyectado/editable.

### Transit Analyses

Período de tránsitos y eclipses asociado a un consultante.

### Transit Positions / Aspects / Eclipses

Datos astrológicos del período, cargados a mano.

### Transit Reports / Transit Client Reports

Informe profesional y versión consultante del período, mismo lifecycle que natal.

### Solar Returns

Período de Revolución Solar (inicio/fin) asociado a un consultante.

### Solar Return Positions / Aspects / Natal Aspects

Posiciones RS, aspectos internos y contactos con la Carta Natal, más síntesis de elementos y regente del Ascendente.

### Solar Return Reports / Solar Return Client Reports

Informe profesional de 12 secciones y versión consultante proyectada.

---

## Report Lifecycle

Generate
↓
Original generado (`generated_report`)
+
Professional report (`report`, status `draft`)
↓
Professional edit
↓
reviewed
↓
ready
↓
Prepare client version
↓
Client edit
↓
PDF

Si el informe profesional cambia después de preparar la versión consultante:

`sourceOutdated = true`

La versión consultante permanece accesible.

Refresh es explícito.

Refresh:

- no llama Gemini;
- actualiza el snapshot `source_report`;
- reproyecta la versión consultante;
- mantiene el mismo ID de client report (contrato actual: update in place).

Cambiar status no regenera Gemini, no muta Original y no refresca la versión consultante.

---

## Status Model

Internal:

- `draft`
- `reviewed`
- `ready`

UI:

- Borrador
- Revisado
- Listo para entregar

Editar el informe profesional vuelve el status a `draft` en los tres módulos. Comportamiento verificado en:

- `updateNatalChartReport`
- `updateTransitAnalysisProfessionalReport`
- `updateSolarReturnProfessionalReport`

---

## PDF Architecture

Professional PDF source: informe profesional editable (`report`).

Client PDF source: versión consultante (`client_report`).

El Original generado no se usa como fuente del PDF profesional.

El PDF consultante no se bloquea automáticamente por `sourceOutdated`.

Render server-side. No muta estado.

---

## V1 QA Status

Final technical QA: PASS WITH WARNINGS

Open:

- P0: 0
- P1: 0

Checks (última corrida de cierre, 2026-09-09):

- tests: 66 archivos `src/**/*.test.ts`
- TypeScript: `npx tsc --noEmit`
- ESLint: `npx eslint src --max-warnings 0`
- production build: `npx next build`

Limitación del QA:

No hubo E2E autenticado automatizado completo (no hay suite Playwright de UI ni fixture de auth en el repo).

Sí hubo uso y validación manual en producción durante el desarrollo, incluyendo revisión metodológica de contenido real de Revolución Solar por Paula.

No se afirma verificación live de RLS/triggers/cascade contra la base desplegada desde el QA automatizado.

---

## Known Backlog After V1

No se corrige en este cierre.

### P2

Transit pending recency:

`transit_analysis_reports` no tiene `updated_at`.

Home pending usa `created_at`.

Editar o cambiar status de un informe de Tránsitos no actualiza su posición de recencia en Home.

Impacto: solo orden/recencia de pending.

No afecta generación, edición, status, Original, versión consultante, refresh ni PDF.

Un fix futuro probablemente requiere migration.

### P3

- update/delete de Transit y Revolución Solar no bindean explícitamente el `clientId` de la URL al recurso; RLS protege ownership entre usuarios;
- `astrologicalBasis` es inmutable en la capa de aplicación, no de forma universal por trigger de DB sobre el JSON `report`;
- el refresh natal no re-chequea `sourceOutdated` en servidor (sí exige profesional `ready`);
- códigos internos de error de generación pueden aparecer solo en UI de development;
- helpers de fecha `formatIsoDateOnlyEs` y `formatSolarReturnPeriod` viven fuera de `src/lib/dates.ts`;
- el PDF profesional natal incluye el nombre del modelo Gemini en metadatos técnicos del documento.

---

## Backup / Operations Note

V1 utiliza Supabase Free.

Automatic backups are not currently available in the active plan.

Current decision: backup automation deferred during initial usage stage.

This is accepted operationally for V1.

---

## Deployment

Production deploy: Vercel

Database migrations: archivos en `supabase/migrations/`, aplicadas en el proyecto Supabase.

No hay GitHub Actions requerido para la operación actual.

Workflow real de deploy en esta máquina:

- una vez: `npm run deploy:setup`
- cada producción: `npm run deploy:prod`

`npm run deploy:prod` usa un token persistente de cuenta. El comando cotidiano no es `vercel --prod` (ese camino falla por OAuth/OIDC de corta duración).

---

## Post-V1 Change Policy

V1 está cerrada.

A partir de este punto:

- el feedback real de Paula debe registrarse;
- los bugs deben clasificarse por severidad;
- los cambios metodológicos deben estar motivados por feedback concreto;
- los cambios metodológicos sustantivos deben incrementar la versión correspondiente;
- las nuevas funcionalidades deben evaluarse como mantenimiento V1.x o como V2;
- evitar modificar prompts / metodología sin un caso real que lo justifique;
- preservar regresión de Natal / Transit / Solar Return.

---

## V1 Acceptance

Carta Natal:
technical validation: approved
methodological validation: approved

Tránsitos y Eclipses:
technical validation: approved
methodological validation: approved

Revolución Solar:
technical validation: approved
methodological validation: approved by Paula after review of real generated output

UX/UI:
approved after final production review

Overall:
Mandala Evolutivo V1 CLOSED.

Date:
2026-09-09.
