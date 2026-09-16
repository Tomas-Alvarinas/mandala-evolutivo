import { NATAL_CHART_CLIENT_SECTION_TITLES } from "./titles";
import type { NatalChartClientReport } from "./types";

const introAndFirstSection = [
  "Esta lectura acompaña un proceso de presencia más auto\u00ADcustodiada, sin apuro por resolverte.",
  "El mapa no pide que híper\uFFFE\uFFFDcontrolar cada movimiento: invita a habitar lo que ya está vivo, con más aire y menos exigencia.",
  "Hay una dirección clara: sostener tu sensibilidad como inteligencia, no como carga, y elegir el siguiente paso desde el cuerpo.",
].join("\n\n");

const finalSynthesis = [
  "El camino no pide una versión perfecta de vos. Pide continuidad, honestidad y un ritmo que tu sistema nervioso pueda habitar.",
  "Cuando vuelvas a este texto, elegí una sola práctica. La transformación se sostiene en lo pequeño que sí se cumple.",
].join("\n\n");

function emotionalBody() {
  return [
    "Tu mundo emocional tiene profundidad y memoria. Siente antes de nombrar, y a veces eso se traduce en un cuidado extremo de lo que mostrás.",
    "Hay una lealtad antigua a no incomodar. Esa lealtad protege, y también puede dejar afuera necesidades que merecen existir sin justificación.",
    "Cuando el vínculo se vuelve intenso, el cuerpo registra más de lo que la palabra alcanza. No es exceso: es un radar fino que pide ritmo y contención.",
    "La emoción no pide ser resuelta de inmediato. Pide ser habitada con dignidad, sin convertirte en traductor permanente de lo que otros sienten.",
    "Hay una diferencia entre sostener y absorber. El aprendizaje evolutivo está en reconocer cuándo el cuidado se volvió desaparición propia.",
    "Permitirte enojarte sin culpa, o alegrarte sin explicarlo, es parte de recuperar un espacio interno que no depende de la aprobación externa.",
    "En los momentos de saturación, el retiro no es abandono: es higiene. Volver después, más entero, también es una forma de amor.",
    "Este tramo del mapa invita a tratar tu sensibilidad como un órgano de orientación, no como un problema a corregir.",
  ].join("\n\n");
}

function vocationBody() {
  return [
    "Tu vocación no se agota en un cargo. Se expresa en la calidad de presencia que aportás cuando algo verdadero está en juego.",
    "Hay una tensión entre el deseo de ofrecer algo bello y el miedo a quedar expuesto. Esa tensión no te anula: te pide un formato más humano.",
    "El trabajo puede volverse un lugar donde demostrás valor. El riesgo es que el valor quede atado al rendimiento y no a la dirección interior.",
    "Hay talento para sostener procesos, leer climas y dar forma a lo complejo. Eso pide contextos que respeten el tiempo de maduración.",
    "No necesitás una identidad profesional rígida para ser coherente. Necesitás un criterio: ¿esto me acerca a lo que quiero cultivar?",
    "Cuando la vocación se vive como servicio infinito, el cuerpo paga la cuenta. El siguiente paso es dosificar la entrega sin apagar el llamado.",
    "Hay un modo de trabajar que te alinea: menos dispersión, más profundidad, y una autoría que no necesita gritar para existir.",
    "Este capítulo no pide un giro dramático. Pide elegir, con más claridad, dónde vale la pena poner tu energía este tramo.",
  ].join("\n\n");
}

export function createPdfLayoutSampleReport(): NatalChartClientReport {
  return {
    metadata: {
      version: "1.0",
      createdAt: "2026-08-28T12:00:00.000Z",
    },
    cover: {
      title: "Tu Mandala Evolutivo",
      subtitle: "Lectura evolutiva de tu Carta Natal",
      clientName: "Tomas Alvariñas",
    },
    introduction: {
      content: introAndFirstSection,
    },
    sections: [
      {
        sourceSectionId: "evolutionaryMandalaSummary",
        kind: "narrative",
        title: NATAL_CHART_CLIENT_SECTION_TITLES.evolutionaryMandalaSummary,
        content: `  ${introAndFirstSection}  `,
      },
      {
        sourceSectionId: "identity",
        kind: "narrative",
        title: NATAL_CHART_CLIENT_SECTION_TITLES.identity,
        content:
          "Tu identidad se organiza alrededor de una presencia lúcida y una necesidad de coherencia. Hay un modo propio de estar que no pide disfraz, aunque a veces el entorno premie una versión más dura o más rápida. Recuperar tu forma no es un gesto estético: es una decisión ética de no traicionarte para encajar.",
      },
      {
        sourceSectionId: "emotionalWorld",
        kind: "narrative",
        title: NATAL_CHART_CLIENT_SECTION_TITLES.emotionalWorld,
        content: emotionalBody(),
      },
      {
        sourceSectionId: "potential",
        kind: "narrative",
        title: NATAL_CHART_CLIENT_SECTION_TITLES.potential,
        content:
          "Tus potencialidades se encienden cuando hay sentido, belleza y un margen para pensar con calma. Tenés recursos de síntesis, escucha y creación que se vuelven nítidos cuando no estás en modo supervivencia. El potencial no pide más esfuerzo: pide un contexto que no te pida desaparecer.",
      },
      {
        sourceSectionId: "evolutionaryChallenges",
        kind: "narrative",
        title: NATAL_CHART_CLIENT_SECTION_TITLES.evolutionaryChallenges,
        content:
          "El desafío no es volverte más fuerte. Es volverte más verdadero sin usar la exigencia como motor. Hay una lección de límites, de tiempo propio y de no convertir cada vínculo en una tarea de reparación.",
      },
      {
        sourceSectionId: "shadowPatterns",
        kind: "narrative",
        title: NATAL_CHART_CLIENT_SECTION_TITLES.shadowPatterns,
        content:
          "En sombra aparece el control fino, la autoexigencia y la idea de que si no anticipás, algo se rompe. Ese patrón tuvo una función. Hoy pide ser mirado con respeto y, después, soltado en dosis humanas.",
      },
      {
        sourceSectionId: "systemicAndAstrogenealogicalReading",
        kind: "narrative",
        title:
          NATAL_CHART_CLIENT_SECTION_TITLES.systemicAndAstrogenealogicalReading,
        content:
          "Hay hilos familiares donde el cuidado, el silencio o la responsabilidad temprana ocuparon el lugar del juego. Reconocerlos no es acusar: es dejar de repetir un contrato que ya no te corresponde firmar.",
      },
      {
        sourceSectionId: "innerDialogue",
        kind: "narrative",
        title: NATAL_CHART_CLIENT_SECTION_TITLES.innerDialogue,
        content:
          "El diálogo interno puede ser lúcido y, a la vez, implacable. Hay una voz que corrige antes de acompañar. El trabajo no es silenciarla: es no dejarla conducir sola.",
      },
      {
        sourceSectionId: "relationships",
        kind: "narrative",
        title: NATAL_CHART_CLIENT_SECTION_TITLES.relationships,
        content:
          "En los vínculos buscás profundidad y lealtad. El riesgo es anticipar la necesidad del otro y postergar la tuya. Un vínculo sano también incluye tu no, tu tiempo y tu derecho a no explicar tanto.",
      },
      {
        sourceSectionId: "security",
        kind: "narrative",
        title: NATAL_CHART_CLIENT_SECTION_TITLES.security,
        content:
          "La seguridad no llega solo por control del entorno. Llega cuando el cuerpo aprende que puede haber sostén sin hipervigilancia. Hay una casa interna que se construye con ritmos, no con certezas absolutas.",
      },
      {
        sourceSectionId: "moneyAndResources",
        kind: "narrative",
        title: NATAL_CHART_CLIENT_SECTION_TITLES.moneyAndResources,
        content:
          "Los recursos se vinculan con el valor propio. Cobrar, pedir y recibir pueden activar antiguas lealtades de no molestar. El dinero, aquí, también es un campo de dignidad.",
      },
      {
        sourceSectionId: "workAndVocation",
        kind: "narrative",
        title: NATAL_CHART_CLIENT_SECTION_TITLES.workAndVocation,
        content: vocationBody(),
      },
      {
        sourceSectionId: "bodyWellbeingAndHabits",
        kind: "narrative",
        title: NATAL_CHART_CLIENT_SECTION_TITLES.bodyWellbeingAndHabits,
        content:
          "El cuerpo registra antes que la agenda. Sueño, comida, movimiento y pausas no son accesorios: son el idioma en el que tu sistema dice si el ritmo actual es habitable.",
      },
      {
        sourceSectionId: "evolutionaryPurpose",
        kind: "narrative",
        title: NATAL_CHART_CLIENT_SECTION_TITLES.evolutionaryPurpose,
        content:
          "El propósito se parece menos a una misión heroica y más a una forma de estar: crear sentido, cuidar lo vivo y no abandonarte en el camino. Esa dirección ya está. Pide continuidad, no un anuncio.",
      },
      {
        sourceSectionId: "nervousSystemRegulation",
        kind: "narrative",
        title: NATAL_CHART_CLIENT_SECTION_TITLES.nervousSystemRegulation,
        content:
          "Regular no es apagarte. Es volver a un rango donde podés sentir y pensar al mismo tiempo. La respiración, el límite y la pausa son herramientas, no premios que hay que merecer.",
      },
      {
        sourceSectionId: "survivalMode",
        kind: "narrative",
        title: NATAL_CHART_CLIENT_SECTION_TITLES.survivalMode,
        content:
          "En modo supervivencia aparece la prisa, el control y la idea de que no hay margen. Reconocerlo temprano permite elegir una respuesta más pequeña y más cierta, en lugar de una sobreactuación.",
      },
      {
        sourceSectionId: "creativeMode",
        kind: "narrative",
        title: NATAL_CHART_CLIENT_SECTION_TITLES.creativeMode,
        content:
          "El modo creativo aparece cuando hay juego, belleza y un poco de desorden fértil. No necesita permiso perfecto. Necesita un rato protegido y una exigencia más baja.",
      },
      {
        sourceSectionId: "beliefsToExplore",
        kind: "list",
        title: NATAL_CHART_CLIENT_SECTION_TITLES.beliefsToExplore,
        items: [
          "Si no anticipo, algo importante se rompe.",
          "Mi valor depende de lo útil que sea para otros.",
          "Pedir es una forma de incomodar.",
          "Descansar se gana después de merecerlo.",
        ],
      },
      {
        sourceSectionId: "byronKatieQuestions",
        kind: "list",
        title: NATAL_CHART_CLIENT_SECTION_TITLES.byronKatieQuestions,
        items: [
          "¿Es realmente cierto que tenés que resolver esto ahora?",
          "¿Podés saber de forma absoluta que esa exigencia es tuya?",
          "¿Quién serías, en este mismo instante, sin esa creencia?",
          "¿Qué aparece cuando imaginás lo contrario con honestidad?",
        ],
      },
      {
        sourceSectionId: "identityReprogramming",
        kind: "narrative",
        title: NATAL_CHART_CLIENT_SECTION_TITLES.identityReprogramming,
        content:
          "Hay una identidad posible más simple: alguien que cuida su presencia, elige con más claridad y no se desaparece para sostener el clima. Esa versión no se impone. Se ensaya.",
      },
      {
        sourceSectionId: "dispenzaInspiredWork",
        kind: "narrative",
        title: NATAL_CHART_CLIENT_SECTION_TITLES.dispenzaInspiredWork,
        content:
          "Una práctica breve de atención puede bastar: sentar el cuerpo, recordar una escena de coherencia y quedarte ahí un minuto más de lo habitual. La repetición amable enseña más que el esfuerzo heroico.",
      },
      {
        sourceSectionId: "practicalActions",
        kind: "list",
        title: NATAL_CHART_CLIENT_SECTION_TITLES.practicalActions,
        items: [
          "Elegí una pausa cotidiana de cinco minutos y sostenela durante una semana, sin usarla para producir.",
          "Escribí un límite concreto que hoy evitás nombrar y ensayalo en voz baja antes de decirlo.",
          "Reservá un bloque semanal para un trabajo que te alinee, protegido de interrupciones.",
          "Antes de responder un pedido urgente, preguntate si tu cuerpo tiene margen real para decir que sí.",
        ],
      },
      {
        sourceSectionId: "empoweringWords",
        kind: "list",
        title: NATAL_CHART_CLIENT_SECTION_TITLES.empoweringWords,
        items: [
          "Presencia",
          "Ritmo",
          "Dignidad",
          "Límite",
          "Belleza",
          "Continuidad",
        ],
      },
      {
        sourceSectionId: "symbolsAndColors",
        kind: "symbolsAndColors",
        title: NATAL_CHART_CLIENT_SECTION_TITLES.symbolsAndColors,
        symbols: [
          {
            symbol: "Círculo",
            meaning: "Un centro que no se disuelve para sostener el afuera.",
          },
          {
            symbol: "Semilla",
            meaning: "Procesos que piden tiempo y no se fuerzan a florecer.",
          },
          {
            symbol: "Umbral",
            meaning: "El derecho a entrar y salir sin explicarte tanto.",
          },
        ],
        colors: [
          {
            color: "Tierra cálida",
            intention: "Volver al cuerpo cuando la mente acelera.",
          },
          {
            color: "Verde suave",
            intention: "Dar permiso a la regeneración sin culpa.",
          },
          {
            color: "Oro mate",
            intention: "Recordar valor sin exhibición.",
          },
        ],
      },
      {
        sourceSectionId: "mandalaIntervention",
        kind: "mandala",
        title: NATAL_CHART_CLIENT_SECTION_TITLES.mandalaIntervention,
        intention:
          "Crear un espacio visual donde tu presencia pueda descansar sin desaparecer. El mandala no es un adorno: es una práctica de volver al centro cuando el entorno pide demasiado. Que cada trazo recuerde que hay un ritmo propio, más honesto que la prisa.",
        assignment:
          "Trabajá sobre un círculo amplio. Empezá por un centro claro y estable. Desde ahí, dejá que los elementos se organicen en capas, sin llenar todo el espacio. Reservá zonas de silencio. Si aparece el impulso de híper\u00ADcontrolar el resultado, pausá y volvé al gesto más simple que todavía sienta verdadero.",
        elements: [
          "Un centro contenido, sin exceso de detalle.",
          "Una capa media con formas que respiren.",
          "Un borde permeable, no una muralla.",
          "Un acento de color que marque dignidad, no alarma.",
        ],
        questions: [
          "¿Dónde estoy desapareciendo para que el conjunto se vea ordenado?",
          "¿Qué parte de esta imagen pide más aire y no más trabajo?",
          "¿Qué gesto mínimo restauraría honestidad en el centro?",
          "¿Qué dejaría afuera si priorizara mi ritmo y no la exigencia?",
        ],
      },
      {
        sourceSectionId: "finalSynthesis",
        kind: "narrative",
        title: NATAL_CHART_CLIENT_SECTION_TITLES.finalSynthesis,
        content: finalSynthesis,
      },
    ],
    closing: {
      content: `\n${finalSynthesis}\n`,
    },
  };
}
