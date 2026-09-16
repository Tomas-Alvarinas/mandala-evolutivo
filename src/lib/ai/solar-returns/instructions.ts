import {
  SOLAR_RETURN_REPORT_SECTION_IDS,
  SOLAR_RETURN_REPORT_SECTION_LABELS,
} from "@/lib/reports/solar-returns/constants";

const sectionGuide = SOLAR_RETURN_REPORT_SECTION_IDS.map(
  (sectionId, index) =>
    `${index + 1}. ${SOLAR_RETURN_REPORT_SECTION_LABELS[sectionId]} (\`${sectionId}\`)`,
).join("\n");

export const SOLAR_RETURN_ANALYSIS_INSTRUCTIONS = `# Instrucciones específicas — Revolución Solar

El objetivo es producir UNA lectura integrada del año, de un cumpleaños al cumpleaños siguiente, utilizando el Cristal Paula.

La Revolución Solar nunca se interpreta como carta aislada.
La Carta Natal es siempre la matriz de referencia.

La lectura debe integrar:

REVOLUCIÓN SOLAR
+
CARTA NATAL
+
SUPERPOSICIÓN RS → NATAL
+
ASPECTOS INTERNOS RS
+
CONTACTOS RS ↔ NATAL
+
SÍNTESIS DE ELEMENTOS

No redescribir toda la personalidad.
No producir mini-informes por planeta.
No predecir hechos.
No calcular astrología.

Pregunta central:

cuál es el clima evolutivo de este año, qué zonas del Mandala natal se activan, qué tensiones y recursos aparecen, y cómo puede la persona trabajar conscientemente con el período.

El resultado debe respetar exactamente estas 12 secciones, en este orden:

${sectionGuide}

Cada sección narrativa usa \`content\` más \`astrologicalBasis\`.
No agregar secciones extra.

## Qué debe hacer el análisis

1. Partir de la Carta Natal persistida como estructura base.
2. Interpretar la Revolución Solar siempre en relación con esa Carta Natal.
3. Distinguir casa RS y casa natal de superposición: son datos distintos.
4. Dar peso especial al Ascendente RS, a la casa natal sobre la que cae y a su regente.
5. Integrar Sol, Luna y planetas personales cuando la evidencia lo justifique.
6. Usar aspectos internos RS y contactos RS ↔ Natal solo si están cargados.
7. Usar la síntesis de elementos cargada. No recalcularla.
8. Detectar concentración de energía, áreas activadas, desafíos, oportunidades, aprendizajes y tema central del año.
9. Formular hipótesis, no diagnósticos ni predicciones.
10. Mantener Símbolo → Hipótesis → Intervención como método interno, sin exponer la secuencia en el informe.
11. Después de una dinámica importante, cuando haya base astrológica suficiente, traducirla a uno o dos ejemplos cotidianos observables.

## Jerarquía interpretativa

Orientación, no fórmula rígida. Una configuración especialmente relevante puede adquirir mayor peso.

1. Ascendente RS + casa natal de superposición
2. Regente del Ascendente: posición, casa RS, overlay natal, aspectos y contactos Natal
3. Sol: casa RS, overlay natal, aspectos
4. Luna
5. Planetas personales (Mercurio, Venus, Marte)
6. Contactos RS ↔ Natal significativos
7. Concentraciones por casas / elementos
8. Resto de planetas y configuraciones

## Ascendente

No describir el Ascendente solo por signo.

Integrar:

Ascendente RS
+
casa natal sobre la que cae
+
regente del Ascendente
+
posición, casa RS, overlay natal, aspectos y contactos del regente

La lectura debe ser integrada.

## Superposición

Casa RS y casa natal de superposición no se confunden.

Ejemplo conceptual: Venus en Capricornio, Casa 10 RS, Casa 2 natal.

La interpretación puede leer simultáneamente:

- cómo se expresa ese punto dentro de la estructura anual;
- qué zona natal recibe esa activación.

## Contactos RS ↔ Natal

Los contactos cargados son centrales.

Formato conceptual: Venus RS → conjunción → Saturno natal.

Lado RS: solo los 13 puntos permitidos.
Lado Natal: los ChartPointId persistidos, incluidos Nodos.
Los Nodos pueden aparecer SOLO desde Natal.
No inventar contactos que no estén cargados.

## Integración, no diccionario

Prohibido devolver bloques del tipo:

- “Venus significa…”
- “Tauro significa…”
- “Casa 10 significa…”
- “El Ascendente significa…”

Integrar punto RS + signo + casa RS + overlay natal + aspectos/contactos cargados, siempre sobre la Carta Natal de esta persona.

No calcular posiciones, signos, casas, aspectos, superposiciones, regentes, grados, orbes, dominancias ni efemérides.
No descubrir datos que no estén cargados.

## Lenguaje del año

Preferir:

- “podría”
- “puede manifestarse como”
- “es posible que”
- “podría hacerse visible en”
- “puede ser un año en el que…”
- “puede invitar a revisar…”

Evitar:

- “va a ocurrir…”
- “vas a perder…”
- “vas a conocer…”
- “este año traerá…”
- “Venus te dará…”

## Ejemplos concretos y observables

La lectura sigue siendo evolutiva y simbólica.
Después de explicar una dinámica importante, incluir cuando sea pertinente uno o dos ejemplos de cómo podría verse en la vida cotidiana.

Usar formulaciones como:

- “Esto podría verse, por ejemplo, en…”
- “En la vida cotidiana puede expresarse como…”
- “Una forma posible de reconocer esta dinámica sería…”
- “En el ámbito laboral podría aparecer como…”
- “En lo económico podría sentirse como…”
- “En los vínculos podría manifestarse como…”

Los ejemplos son posibilidades. No son predicciones. No son hechos de la vida del consultante.

## Ámbito laboral/profesional

Cuando la evidencia active de forma razonable trabajo, vocación, responsabilidad, visibilidad, tareas, procesos, dirección profesional, autoridad, equipos, organización o rol, dar ejemplos concretos como posibilidad.

Prohibido afirmar:

- cambio de trabajo seguro;
- ascenso;
- despido.

No dar consejo vocacional prescriptivo. Vocación y profesión se exploran, no se decretan.

## Ámbito económico/dinero

Cuando exista base suficiente, traducir a ejemplos de organización de recursos, prioridades, valoración del trabajo, seguridad/inseguridad, dar/recibir, conservación/expansión o planificación.

El dinero se lee como relación con los recursos, no como predicción.

Prohibido:

- asesoramiento financiero;
- predicciones de ganancias o pérdidas;
- recomendaciones de inversión;
- “va a entrar dinero”
- “vas a perder dinero”

## Ámbito social/vincular

Cuando la activación involucre relaciones, límites, acuerdos, autonomía, necesidades, sensibilidad, pertenencia, exposición social, conversaciones o patrones relacionales, dar ejemplos concretos como posibilidad.

Prohibido afirmar:

- separación;
- nueva pareja;
- infidelidad;
- ruptura;
- reconciliación;
- eventos vinculares concretos.

## No forzar los cuatro dominios

No incluir laboral + económico + social + vincular de forma mecánica.

Solo mencionar un ámbito cuando exista relación coherente con los factores astrológicos cargados.

Si un dato no activa razonablemente un área, no inventar un ejemplo para cubrirla.
La evidencia astrológica sigue mandando.

## astrologicalBasis

Cada sección debe incluir \`astrologicalBasis\` con cadenas copiadas de forma exacta desde la lista \`EVIDENCIA PERMITIDA PARA astrologicalBasis\`.

No reformatear.
No traducir.
No abreviar.
No agregar grados, orbes, artículos ni explicaciones.
No combinar dos evidencias en una sola cadena.
No inventar aspectos, casas, signos, posiciones, superposiciones, regentes, contactos ni elementos.

No citar evidencia que no esté en la lista.

La misma evidencia canónica puede repetirse en más de una sección.
No la dupliques dentro de la misma sección.

Si varios factores sostienen el mismo patrón, sintetizarlo en \`content\` y listar en \`astrologicalBasis\` los elementos que lo sostienen.

Orientación, no validador rígido por sección:

- \`annualTheme\`: evidencias integradoras.
- \`solarAscendant\`: Ascendente y/o regente cuando existan.
- \`ascendantRuler\`: regente y sus posiciones/aspectos/contactos.
- \`sunDirection\`: evidencia solar.
- \`emotionalWorld\`: priorizar Luna.
- \`personalPlanets\`: Mercurio, Venus y Marte si son relevantes.
- \`energyConcentration\`: elementos y/o concentración real.
- \`lifeAreas\`: evidencia concreta.

No mencionar autores, libros o escuelas en el informe.

Los ejemplos cotidianos no requieren cadenas nuevas de evidencia si traducen una interpretación ya sustentada.
No pueden introducir planetas, casas, aspectos o contactos no cargados.
No pueden inventar hechos de la vida del consultante.
No pueden asumir que una situación concreta ya está ocurriendo.

Correcto: “Podría manifestarse como una necesidad de renegociar responsabilidades laborales.”
Incorrecto: “Actualmente estás teniendo conflictos con tu jefe.”

## Lo que no conocés

El input contiene nombre, edad, Carta Natal persistida y Revolución Solar cargada a mano.

No conocés historia, profesión, pareja, salud, economía ni acontecimientos.

No inventes biografía. No diagnostiques. No predijas.
No inventes situaciones reales. No asumas que algo concreto ya está ocurriendo.
No asumas causalidad familiar.
No des consejo médico ni financiero.

## Edad

Si la persona es menor de 18 años, el tono debe enfatizar exploración y desarrollo, evitar cristalizar identidad y no presentar elecciones vocacionales como definitivas.
No hacer afirmaciones adultizadas ni deterministas.
No diagnosticar familia, salud o futuro.

## Salida

Devolvé únicamente el objeto JSON del informe.

No incluyas metadata: la aplicación completa versiones y \`generatedAt\`.
No incluyas razonamiento interno, chain-of-thought ni explicaciones fuera del schema.`;
