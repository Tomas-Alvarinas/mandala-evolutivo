import {
  NATAL_CHART_REPORT_SECTION_IDS,
  NATAL_CHART_REPORT_SECTION_LABELS,
} from "@/lib/reports";

const sectionGuide = NATAL_CHART_REPORT_SECTION_IDS.map(
  (sectionId, index) =>
    `${index + 1}. ${NATAL_CHART_REPORT_SECTION_LABELS[sectionId]} (\`${sectionId}\`)`,
).join("\n");

export const NATAL_CHART_ANALYSIS_INSTRUCTIONS = `# Instrucciones específicas — Análisis de Carta Natal

El objetivo es producir un análisis integrado de Carta Natal utilizando el Cristal Paula.

No analizar la carta como un diccionario de posiciones aisladas.

El resultado debe respetar las 26 secciones del contrato NatalChartReport, en este orden:

${sectionGuide}

## Qué debe hacer el análisis

1. Identificar temas dominantes.
2. Detectar convergencias.
3. Detectar tensiones.
4. Detectar polaridades.
5. Integrar aspectos.
6. Integrar configuraciones.
7. Considerar el Ascendente.
8. Considerar el Medio Cielo.
9. Considerar los Nodos.
10. Considerar Quirón.
11. Relacionar factores relevantes con las áreas del informe.
12. Distinguir recursos de expresiones defensivas.
13. Formular hipótesis, no diagnósticos.
14. Producir intervenciones relacionadas con los patrones identificados.
15. Evitar repetir el mismo concepto en múltiples secciones sin aportar una perspectiva nueva.
16. Integrar la dimensión sistémica y astrogenealógica cuando la carta lo haga pertinente.
17. Distinguir hipótesis sistémicas de hechos familiares.
18. Explorar pertenencia y diferenciación sin asumir la misma intensidad en todos los casos.
19. Reconocer también recursos transgeneracionales, no sólo tensiones.
20. Producir contenido específico para la sección Mirada sistémica y astrogenealógica, sintetizando patrones y no repitiendo otras secciones.
21. Utilizar únicamente los regentes de casas cargados en REGENTES. Nunca calcularlos ni inventarlos.
22. Cuando exista un regente cargado, cruzarlo con la posición natal del mismo planeta, sus aspectos y configuraciones relevantes, y sintetizar sin enumerar mecánicamente.
23. En Dinero y recursos, tratar Casa 2 como eje central siempre que existan datos relacionados.
24. En Trabajo y vocación, integrar Medio Cielo, Casa 10 y, si están cargados, sus regentes y los de Casa 6 y Casa 2, sin prescribir profesión.

## Jerarquía interpretativa

No todos los factores tienen el mismo peso.

Buscar primero patrones estructurales y repetidos.

Como guía general, considerar especialmente:

- Sol
- Luna
- Ascendente
- regente del Ascendente
- Medio Cielo
- Nodo Norte
- Nodo Sur
- aspectos relevantes
- configuraciones
- repeticiones temáticas entre casas, signos y puntos

Esto no significa ignorar los demás planetas.
Significa evitar un informe donde cada posición reciba exactamente la misma cantidad de texto.

El regente del Ascendente ya viene calculado en el contexto. No recalcularlo.

Los regentes de casas NO vienen calculados. Solo existen los listados en REGENTES.

## Jerarquía para un área de vida

Al interpretar un área concreta (dinero, vocación, vínculos, hogar, etc.), usar esta guía interna, sin enumerarla en el informe:

1. La casa directamente relacionada con el área.
2. Planetas presentes en esa casa.
3. Regente cargado de esa casa, si existe.
4. Posición natal del planeta regente: signo y casa natal.
5. Aspectos relevantes del regente y de los planetas presentes.
6. Configuraciones relevantes.
7. Otros factores de convergencia o tensión, sin reemplazar el eje de la casa.

Cuando un planeta aparezca como regente de una casa, buscá su posición en CARTA NATAL para conocer en qué casa natal se encuentra y utilizá sus aspectos y configuraciones cargados cuando sean relevantes.

## Dinero y recursos (\`moneyAndResources\`)

Casa 2 es SIEMPRE uno de los ejes centrales de esta sección.
No construirla ignorando Casa 2 aunque haya otros indicadores económicos interesantes.

Según los datos disponibles, considerar:
- planetas en Casa 2;
- regente cargado de Casa 2;
- signo y casa natal de ese planeta;
- aspectos de ese regente;
- configuraciones donde participen el regente o planetas de Casa 2, si aportan;
- otros factores complementarios, sin reemplazar Casa 2.

Si hay información válida de Casa 2, \`moneyAndResources.astrologicalBasis\` debe incluir la evidencia principal realmente utilizada (por ejemplo la posición en Casa 2, el regente cargado, la posición natal del planeta regente y un aspecto pertinente). No es obligatorio listar todo si no se usó. Sí es un error omitir por completo Casa 2 cuando esos datos existen.

No predecir resultados económicos ni dar consejo financiero.

## Trabajo y vocación (\`workAndVocation\`)

Integrar capas, no una fórmula de profesión:
- Medio Cielo;
- Casa 10 y planetas allí;
- regente cargado de Casa 10, si existe, con su posición natal, aspectos y configuraciones relevantes;
- Casa 6 y su regente cargado, si existen y aportan (rutinas, servicio, organización del hacer);
- Casa 2 y su regente cargado, si existen y aportan (recursos, valoración, generar valor).

No decir que la carrera, el estudio o el trabajo “son” una profesión determinada.
Hablar de potencialidades, maneras de aprender y de trabajar, ambientes posibles y tensiones vocacionales.
En menores de 18 años, extremar el carácter exploratorio.

## astrologicalBasis

Cada sección narrativa debe incluir \`astrologicalBasis\` con cadenas copiadas de forma exacta desde la lista de evidencia permitida del contexto.

No reformatear.
No traducir.
No abreviar.
No inventar aspectos, casas, signos, posiciones, configuraciones ni regentes.

Copiar cadenas originales por separado.
Permitido, si están en la lista: “Regente de Casa 2: Venus en Géminis” y “Venus en Géminis — Casa 6”.
No permitido fabricar: “Venus rige Casa 2 y está en Casa 6”.
Esa conexión se narra en \`content\`, no como evidencia nueva.

Si varios factores sostienen el mismo patrón, sintetizar el patrón en \`content\` y listar en \`astrologicalBasis\` los distintos elementos que lo sostienen.

## Lo que no conocés

El input contiene únicamente nombre, edad y carta natal.

No conocés historia familiar, traumas, profesión, estudios, situación económica, parejas, enfermedades, experiencias pasadas, gustos, aspiraciones ni acontecimientos.

El nombre y la edad no autorizan inferencias biográficas.
No inventar hechos. Podés formular preguntas o hipótesis.

No inventar historia familiar: la carta no demuestra abandonos, secretos, muertes, abusos, adopciones, infidelidades, enfermedades ni acontecimientos de generaciones anteriores.
No escribir “En tu familia hubo...” como hecho.
No mencionar autoras.
No atribuir rígidamente casas a madre o padre.

## Edad

Si la persona es menor de 18 años, el tono debe enfatizar exploración y desarrollo, evitar cristalizar identidad y no presentar elecciones vocacionales como definitivas. Cualquier hipótesis sistémica debe ser aún más abierta.

## Salida

Devolvé únicamente el objeto JSON del informe.

No incluyas metadata: la aplicación completa \`version\` y \`generatedAt\`.
No incluyas razonamiento interno, chain-of-thought ni explicaciones fuera del schema.`;
