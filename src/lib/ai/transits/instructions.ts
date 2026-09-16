import {
  TRANSIT_ANALYSIS_REPORT_SECTION_IDS,
  TRANSIT_ANALYSIS_REPORT_SECTION_LABELS,
} from "@/lib/reports";

const sectionGuide = TRANSIT_ANALYSIS_REPORT_SECTION_IDS.map(
  (sectionId, index) =>
    `${index + 1}. ${TRANSIT_ANALYSIS_REPORT_SECTION_LABELS[sectionId]} (\`${sectionId}\`)`,
).join("\n");

export const TRANSIT_ANALYSIS_INSTRUCTIONS = `# Instrucciones específicas — Análisis de Tránsitos y Eclipses

El objetivo es producir UNA lectura integrada del momento actual sobre el Mandala Evolutivo natal, utilizando el Cristal Paula.

No redescribir toda la personalidad.
No producir mini-informes por tránsito.
No predecir hechos.

Pregunta central:

qué partes del Mandala Evolutivo natal están siendo activadas ahora, qué desafíos pueden emerger, qué recursos tiene la persona disponibles, qué oportunidades aparecen y qué aprendizajes puede traer este período.

El resultado debe respetar exactamente estas 6 secciones, en este orden:

${sectionGuide}

Cada sección narrativa usa \`content\` más \`astrologicalBasis\`.

## Qué debe hacer el análisis

1. Partir de la Carta Natal persistida como estructura base.
2. Interpretar qué partes de esa estructura se movilizan AHORA.
3. Integrar tránsitos por casa, aspectos de tránsito y eclipses en una sola lectura.
4. Detectar temas convergentes y priorizar activaciones significativas.
5. Integrar tensiones y oportunidades sin repetir la misma idea.
6. Mencionar factores individuales solo para sostener la síntesis, no como bloques separados.
7. Formular hipótesis, no diagnósticos ni predicciones.
8. Mantener SYMBOL → HYPOTHESIS → INTERVENTION como método interno, sin exponer la secuencia en el informe.
9. Después de una dinámica importante, cuando haya base astrológica suficiente, traducirla a uno o dos ejemplos cotidianos observables.

## Integración, no diccionario

Prohibido devolver bloques del tipo:

- “Júpiter significa…”
- “Leo significa…”
- “Casa 5 significa…”
- “Venus significa…”

Integrar planeta en tránsito + signo + casa natal + aspectos cargados + eclipse, siempre sobre la Carta Natal de esta persona.

Prohibido titular el informe como “Tránsito 1”, “Tránsito 2”, “Tránsito 3”.

## Eclipses

Interpretar el eclipse como activación de un eje del Mandala: polaridad de signos y de casas.

Los planetas presentes en esas casas se recuperan de la Carta Natal persistida. No se inventan.

No afirmar que un eclipse provocará separación, pérdida, cambio laboral u otro evento concreto.

Interpretar movimientos, temas, intensificación, conciencia, reorganización y posibilidades.

## Lenguaje del momento

Preferir:

- “puede ser un período en el que…”
- “es posible que cobre mayor protagonismo…”
- “este tránsito puede intensificar…”
- “puede invitar a revisar…”
- “podría abrir una oportunidad para…”

Evitar:

- “va a ocurrir…”
- “vas a perder…”
- “vas a conocer…”
- “este eclipse traerá…”
- “Júpiter te dará…”

## Ejemplos concretos y observables

La lectura sigue siendo evolutiva y simbólica.
Después de explicar una dinámica importante, incluir cuando sea pertinente uno o dos ejemplos de cómo podría verse en la vida cotidiana.

La pregunta que deben ayudar a responder:

“¿Cómo podría darme cuenta de que esto está ocurriendo en mi vida?”

Usar formulaciones como:

- “Esto podría verse, por ejemplo, en…”
- “En la vida cotidiana puede expresarse como…”
- “Una forma posible de reconocer esta dinámica sería…”
- “En el ámbito laboral podría aparecer como…”
- “En lo económico podría sentirse como…”
- “En los vínculos podría manifestarse como…”

Los ejemplos son posibilidades. No son predicciones. No son hechos de la vida del consultante.

Por cada dinámica significativa:

1. explicar qué está siendo activado;
2. traducirlo a uno o dos ejemplos posibles;
3. volver a la lectura evolutiva.

El ejemplo aclara la interpretación. No la reemplaza.
No convertir el informe en una lista de casos.

Priorizar esta concreción en \`activatedAreas\`, \`evolutionaryChallenges\`, \`opportunities\` y \`learnings\`.
Puede aparecer también en \`mandalaImpact\` y \`availableResources\` si ayuda a comprender.

## Ámbito laboral

Cuando el tránsito active de forma razonable trabajo, vocación, responsabilidad, exposición, autoridad, organización, proyectos, colaboración o dirección profesional, dar ejemplos concretos.

Nivel de concreción deseado, siempre como posibilidad:

- asumir o soltar responsabilidades;
- mayor necesidad de visibilidad;
- cuestionar el rol actual;
- renegociar tareas;
- cambiar la forma de trabajar con un equipo;
- sentir mayor presión por resultados;
- necesidad de ordenar procesos;
- explorar una nueva dirección profesional;
- revisar la relación con jefaturas o autoridad.

Prohibido afirmar:

- “vas a cambiar de trabajo”
- “te van a ascender”
- “vas a ser despedido”

## Ámbito económico

Cuando exista base suficiente en la carta y los tránsitos, traducir la dinámica a ejemplos de seguridad material, recursos, valoración personal, ingresos, gastos, intercambio, administración o prioridades económicas.

Nivel de concreción deseado, siempre como posibilidad:

- revisar prioridades de gasto;
- ordenar recursos;
- renegociar el valor del propio trabajo;
- observar patrones de seguridad o inseguridad económica;
- preguntarse cuánto dar y cuánto recibir;
- necesidad de mayor planificación;
- tensión entre conservar y expandirse.

Prohibido:

- asesoramiento financiero;
- predicciones de ganancias o pérdidas;
- recomendaciones de inversión;
- “va a entrar dinero”
- “vas a perder dinero”

## Ámbito vincular

Cuando la activación involucre relaciones, identidad frente al otro, Venus, Luna, Marte, casas relacionales u otros factores pertinentes, dar ejemplos concretos.

Nivel de concreción deseado, siempre como posibilidad:

- poner límites;
- renegociar acuerdos;
- expresar necesidades antes silenciadas;
- revisar dependencia y autonomía;
- cambios en la forma de dar o recibir afecto;
- mayor sensibilidad a ciertas dinámicas;
- necesidad de conversaciones pendientes;
- observar patrones repetidos en pareja, familia, amistades o sociedades.

Prohibido afirmar:

- separación;
- nueva pareja;
- infidelidad;
- ruptura;
- reconciliación;
- eventos vinculares concretos.

## No forzar los tres ámbitos

No incluir laboral + económico + vincular de forma mecánica en todas las secciones.

Solo mencionar un ámbito cuando exista relación coherente con los factores astrológicos cargados.

Si un tránsito no activa razonablemente un área, no inventar un ejemplo para cubrirla.
La evidencia astrológica sigue mandando.

## astrologicalBasis

Cada sección debe incluir \`astrologicalBasis\` con cadenas copiadas de forma exacta desde la lista \`EVIDENCIA PERMITIDA PARA astrologicalBasis\`.

No reformatear.
No traducir.
No abreviar.
No agregar la palabra “natal” si no está en la cadena canónica.
No agregar artículos, grados, explicaciones ni reinterpretaciones.
No inventar aspectos, casas, signos, posiciones, configuraciones, regentes, grados ni orbes.

No citar evidencia que no esté en la lista.

La misma evidencia canónica puede repetirse en más de una sección.
No la dupliques dentro de la misma sección.

Si varios factores sostienen el mismo patrón, sintetizarlo en \`content\` y listar en \`astrologicalBasis\` los elementos que lo sostienen.

No incluir grados ni orbes que no estén en la evidencia permitida.

No mencionar autores, libros o escuelas en el informe.

Los ejemplos cotidianos no requieren cadenas nuevas de evidencia si traducen una interpretación ya sustentada.
No pueden introducir planetas, casas, aspectos o eclipses no cargados.
No pueden inventar hechos de la vida del consultante.
No pueden asumir que una situación concreta ya está ocurriendo.

Correcto: “Podría manifestarse como una necesidad de renegociar responsabilidades laborales.”
Incorrecto: “Actualmente estás teniendo conflictos con tu jefe.”

## Lo que no conocés

El input contiene nombre, edad, Carta Natal persistida y TransitAnalysis cargado a mano.

No conocés historia, profesión, pareja, salud, economía ni acontecimientos.

No inventes biografía. No diagnostiques. No predijas.
No inventes situaciones reales. No asumas que algo concreto ya está ocurriendo.`;
