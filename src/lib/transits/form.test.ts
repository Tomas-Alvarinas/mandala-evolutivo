import assert from "node:assert/strict";
import {
  ECLIPSE_TYPES,
  TRANSIT_PLANET_IDS,
  TRANSIT_PLANETS,
} from "./constants";
import {
  commitTransitAspect,
  commitTransitEclipse,
  commitTransitPosition,
  createEmptyTransitAnalysisDraft,
  DUPLICATE_TRANSIT_PLANET_ERROR,
  EMPTY_TRANSIT_ANALYSIS_ERROR,
  toTransitAnalysis,
  toTransitAnalysisFormData,
  transitAnalysisToDraft,
} from "./form";
import {
  formatTransitAspect,
  formatTransitEclipse,
  formatTransitPosition,
  isIsoDateOnly,
  isSameEclipseAxis,
  isTransitPlanetId,
  todayIsoDate,
  transitEclipseAxisKey,
  transitEclipseKey,
} from "./helpers";

function run() {
  assert.deepEqual([...TRANSIT_PLANET_IDS], [
    "sun",
    "moon",
    "mercury",
    "venus",
    "mars",
    "jupiter",
    "saturn",
    "uranus",
    "neptune",
    "pluto",
    "chiron",
  ]);
  assert.equal(isTransitPlanetId("northNode"), false);
  assert.equal(isTransitPlanetId("southNode"), false);
  assert.equal(isTransitPlanetId("ascendant"), false);
  assert.equal(isTransitPlanetId("midheaven"), false);
  assert.equal(isTransitPlanetId("jupiter"), true);
  assert.equal(TRANSIT_PLANETS.length, 11);
  assert.equal(TRANSIT_PLANETS.some((planet) => planet.id === "chiron"), true);
  assert.deepEqual(
    ECLIPSE_TYPES.map((entry) => entry.id),
    ["solar", "lunar"],
  );

  assert.equal(isIsoDateOnly("2026-09-01"), true);
  assert.equal(isIsoDateOnly("2026-02-30"), false);
  assert.equal(isIsoDateOnly("01/09/2026"), false);
  assert.equal(/^\d{4}-\d{2}-\d{2}$/.test(todayIsoDate()), true);

  const jupiterLeo5 = {
    planet: "jupiter" as const,
    sign: "leo" as const,
    natalHouse: 5 as const,
  };
  const saturnSquareMoon = {
    transitPlanet: "saturn" as const,
    aspect: "square" as const,
    natalPoint: "moon" as const,
  };
  const solarLeoAquarius = {
    eclipseType: "solar" as const,
    signA: "leo" as const,
    natalHouseA: 1 as const,
    signB: "aquarius" as const,
    natalHouseB: 7 as const,
  };
  const invertedAxis = {
    eclipseType: "solar" as const,
    signA: "aquarius" as const,
    natalHouseA: 7 as const,
    signB: "leo" as const,
    natalHouseB: 1 as const,
  };

  assert.equal(formatTransitPosition(jupiterLeo5), "Júpiter · Leo · Casa 5");
  assert.equal(
    formatTransitAspect({
      transitPlanet: "jupiter",
      aspect: "square",
      natalPoint: "venus",
    }),
    "Júpiter · Cuadratura · Venus natal",
  );
  assert.equal(
    formatTransitEclipse(solarLeoAquarius),
    "Eclipse solar · Leo Casa 1 ↔ Acuario Casa 7",
  );
  assert.equal(
    transitEclipseAxisKey(solarLeoAquarius),
    transitEclipseAxisKey(invertedAxis),
  );
  assert.equal(isSameEclipseAxis(solarLeoAquarius, invertedAxis), true);
  assert.equal(
    transitEclipseKey(solarLeoAquarius),
    transitEclipseKey(invertedAxis),
  );

  const incompletePosition = commitTransitPosition([], {
    planet: "jupiter",
    sign: "leo",
    natalHouse: null,
  });
  assert.equal(incompletePosition.success, false);
  if (!incompletePosition.success) {
    assert.equal(incompletePosition.error, "Completá planeta, signo y casa.");
  }

  const addedPosition = commitTransitPosition([], jupiterLeo5);
  assert.equal(addedPosition.success, true);

  const jupiterLeo6 = {
    planet: "jupiter" as const,
    sign: "leo" as const,
    natalHouse: 6 as const,
  };
  const jupiterVirgo5 = {
    planet: "jupiter" as const,
    sign: "virgo" as const,
    natalHouse: 5 as const,
  };
  const saturnLeo5 = {
    planet: "saturn" as const,
    sign: "leo" as const,
    natalHouse: 5 as const,
  };

  const samePlanetDifferentHouse = commitTransitPosition(
    [jupiterLeo5],
    jupiterLeo6,
  );
  assert.equal(samePlanetDifferentHouse.success, false);
  if (!samePlanetDifferentHouse.success) {
    assert.equal(samePlanetDifferentHouse.error, DUPLICATE_TRANSIT_PLANET_ERROR);
  }

  const samePlanetDifferentSign = commitTransitPosition(
    [jupiterLeo5],
    jupiterVirgo5,
  );
  assert.equal(samePlanetDifferentSign.success, false);
  if (!samePlanetDifferentSign.success) {
    assert.equal(samePlanetDifferentSign.error, DUPLICATE_TRANSIT_PLANET_ERROR);
  }

  const differentPlanetSameHouse = commitTransitPosition(
    [jupiterLeo5],
    saturnLeo5,
  );
  assert.equal(differentPlanetSameHouse.success, true);

  const exactDuplicatePosition = commitTransitPosition(
    [jupiterLeo5],
    jupiterLeo5,
  );
  assert.equal(exactDuplicatePosition.success, false);
  if (!exactDuplicatePosition.success) {
    assert.equal(exactDuplicatePosition.error, DUPLICATE_TRANSIT_PLANET_ERROR);
  }

  const incompleteAspect = commitTransitAspect([], {
    transitPlanet: "jupiter",
    aspect: "square",
    natalPoint: null,
  });
  assert.equal(incompleteAspect.success, false);

  const duplicateAspect = commitTransitAspect(
    [saturnSquareMoon],
    saturnSquareMoon,
  );
  assert.equal(duplicateAspect.success, false);
  if (!duplicateAspect.success) {
    assert.equal(duplicateAspect.error, "Ese aspecto ya está cargado.");
  }

  const jupiterSquareVenus = {
    transitPlanet: "jupiter" as const,
    aspect: "square" as const,
    natalPoint: "venus" as const,
  };
  const jupiterTrineMoon = {
    transitPlanet: "jupiter" as const,
    aspect: "trine" as const,
    natalPoint: "moon" as const,
  };
  const multipleAspectsSamePlanet = commitTransitAspect(
    [jupiterSquareVenus],
    jupiterTrineMoon,
  );
  assert.equal(multipleAspectsSamePlanet.success, true);

  const incompleteEclipse = commitTransitEclipse([], {
    eclipseType: "solar",
    signA: "leo",
    natalHouseA: 1,
    signB: null,
    natalHouseB: 7,
  });
  assert.equal(incompleteEclipse.success, false);

  const sameSigns = commitTransitEclipse([], {
    eclipseType: "solar",
    signA: "leo",
    natalHouseA: 1,
    signB: "leo",
    natalHouseB: 7,
  });
  assert.equal(sameSigns.success, false);
  if (!sameSigns.success) {
    assert.equal(sameSigns.error, "Elegí dos signos distintos.");
  }

  const sameHouses = commitTransitEclipse([], {
    eclipseType: "lunar",
    signA: "leo",
    natalHouseA: 1,
    signB: "aquarius",
    natalHouseB: 1,
  });
  assert.equal(sameHouses.success, false);
  if (!sameHouses.success) {
    assert.equal(sameHouses.error, "Elegí dos casas distintas.");
  }

  const duplicateInvertedEclipse = commitTransitEclipse(
    [solarLeoAquarius],
    invertedAxis,
  );
  assert.equal(duplicateInvertedEclipse.success, false);
  if (!duplicateInvertedEclipse.success) {
    assert.equal(duplicateInvertedEclipse.error, "Ese eclipse ya está cargado.");
  }

  const lunarSameAxis = commitTransitEclipse([solarLeoAquarius], {
    ...invertedAxis,
    eclipseType: "lunar",
  });
  assert.equal(lunarSameAxis.success, true);

  const parsed = toTransitAnalysis({
    analysisDate: "2026-09-01",
    positions: [jupiterLeo5],
    aspects: [saturnSquareMoon],
    eclipses: [solarLeoAquarius],
  });
  assert.equal(parsed.success, true);

  const incompletePersist = toTransitAnalysis({
    analysisDate: "2026-09-01",
    positions: [{ planet: "jupiter", sign: null, natalHouse: 5 }],
    aspects: [],
    eclipses: [],
  });
  assert.equal(incompletePersist.success, false);
  if (!incompletePersist.success) {
    assert.equal(
      incompletePersist.error,
      "Completá o eliminá los tránsitos incompletos.",
    );
  }

  const duplicatePersist = toTransitAnalysis({
    analysisDate: "2026-09-01",
    positions: [],
    aspects: [],
    eclipses: [solarLeoAquarius, invertedAxis],
  });
  assert.equal(duplicatePersist.success, false);
  if (!duplicatePersist.success) {
    assert.equal(duplicatePersist.error, "Hay eclipses duplicados.");
  }

  const missingDate = toTransitAnalysis({
    analysisDate: "",
    positions: [],
    aspects: [],
    eclipses: [],
  });
  assert.equal(missingDate.success, false);

  const emptyAnalysis = toTransitAnalysis({
    analysisDate: "2026-09-01",
    positions: [],
    aspects: [],
    eclipses: [],
  });
  assert.equal(emptyAnalysis.success, false);
  if (!emptyAnalysis.success) {
    assert.equal(emptyAnalysis.error, EMPTY_TRANSIT_ANALYSIS_ERROR);
  }

  const onlyEclipse = toTransitAnalysis({
    analysisDate: "2026-09-01",
    positions: [],
    aspects: [],
    eclipses: [solarLeoAquarius],
  });
  assert.equal(onlyEclipse.success, true);

  const onlyAspect = toTransitAnalysis({
    analysisDate: "2026-09-01",
    positions: [],
    aspects: [saturnSquareMoon],
    eclipses: [],
  });
  assert.equal(onlyAspect.success, true);

  const onlyTransit = toTransitAnalysis({
    analysisDate: "2026-09-01",
    positions: [jupiterLeo5],
    aspects: [],
    eclipses: [],
  });
  assert.equal(onlyTransit.success, true);

  const persistSamePlanetDifferentHouse = toTransitAnalysis({
    analysisDate: "2026-09-01",
    positions: [jupiterLeo5, jupiterLeo6],
    aspects: [],
    eclipses: [],
  });
  assert.equal(persistSamePlanetDifferentHouse.success, false);
  if (!persistSamePlanetDifferentHouse.success) {
    assert.equal(
      persistSamePlanetDifferentHouse.error,
      DUPLICATE_TRANSIT_PLANET_ERROR,
    );
  }

  const persistSamePlanetDifferentSign = toTransitAnalysis({
    analysisDate: "2026-09-01",
    positions: [jupiterLeo5, jupiterVirgo5],
    aspects: [],
    eclipses: [],
  });
  assert.equal(persistSamePlanetDifferentSign.success, false);

  const persistTwoPlanetsSameHouse = toTransitAnalysis({
    analysisDate: "2026-09-01",
    positions: [jupiterLeo5, saturnLeo5],
    aspects: [],
    eclipses: [],
  });
  assert.equal(persistTwoPlanetsSameHouse.success, true);

  const persistMultipleAspectsSamePlanet = toTransitAnalysis({
    analysisDate: "2026-09-01",
    positions: [],
    aspects: [jupiterSquareVenus, jupiterTrineMoon],
    eclipses: [],
  });
  assert.equal(persistMultipleAspectsSamePlanet.success, true);

  const draft = transitAnalysisToDraft({
    analysisDate: "2026-09-01",
    positions: [jupiterLeo5],
    aspects: [saturnSquareMoon],
    eclipses: [solarLeoAquarius],
  });
  const roundTrip = toTransitAnalysis(toTransitAnalysisFormData(draft));
  assert.equal(roundTrip.success, true);
  if (roundTrip.success) {
    assert.deepEqual(roundTrip.data.positions, [jupiterLeo5]);
    assert.deepEqual(roundTrip.data.aspects, [saturnSquareMoon]);
    assert.deepEqual(roundTrip.data.eclipses, [solarLeoAquarius]);
  }

  const emptyDraft = createEmptyTransitAnalysisDraft("2026-09-01");
  assert.equal(emptyDraft.positions.length, 1);
  assert.equal(emptyDraft.positions[0].planet, null);
  assert.equal(emptyDraft.positions[0].sign, null);
  assert.equal(emptyDraft.positions[0].natalHouse, null);
  assert.equal(emptyDraft.aspects.length, 1);
  assert.equal(emptyDraft.aspects[0].transitPlanet, null);
  assert.equal(emptyDraft.eclipses.length, 1);
  assert.equal(emptyDraft.eclipses[0].eclipseType, null);
  assert.equal(emptyDraft.analysisDate, "2026-09-01");

  const emptyDraftPersist = toTransitAnalysis(
    toTransitAnalysisFormData(emptyDraft),
  );
  assert.equal(emptyDraftPersist.success, false);
  if (!emptyDraftPersist.success) {
    assert.equal(emptyDraftPersist.error, EMPTY_TRANSIT_ANALYSIS_ERROR);
  }

  const skippedEmptyRows = toTransitAnalysis({
    analysisDate: "2026-09-01",
    positions: [
      { planet: null, sign: null, natalHouse: null },
      jupiterLeo5,
    ],
    aspects: [{ transitPlanet: null, aspect: null, natalPoint: null }],
    eclipses: [
      {
        eclipseType: null,
        signA: null,
        natalHouseA: null,
        signB: null,
        natalHouseB: null,
      },
    ],
  });
  assert.equal(skippedEmptyRows.success, true);
  if (skippedEmptyRows.success) {
    assert.deepEqual(skippedEmptyRows.data.positions, [jupiterLeo5]);
    assert.deepEqual(skippedEmptyRows.data.aspects, []);
    assert.deepEqual(skippedEmptyRows.data.eclipses, []);
  }

  const emptyRowsOnly = toTransitAnalysis({
    analysisDate: "2026-09-01",
    positions: [{ planet: null, sign: null, natalHouse: null }],
    aspects: [{ transitPlanet: null, aspect: null, natalPoint: null }],
    eclipses: [
      {
        eclipseType: null,
        signA: null,
        natalHouseA: null,
        signB: null,
        natalHouseB: null,
      },
    ],
  });
  assert.equal(emptyRowsOnly.success, false);
  if (!emptyRowsOnly.success) {
    assert.equal(emptyRowsOnly.error, EMPTY_TRANSIT_ANALYSIS_ERROR);
  }

  const editDraft = transitAnalysisToDraft({
    analysisDate: "2026-09-01",
    positions: [jupiterLeo5],
    aspects: [],
    eclipses: [],
  });
  assert.equal(editDraft.positions.length, 1);
  assert.equal(editDraft.positions[0].planet, "jupiter");
  assert.equal(editDraft.aspects.length, 1);
  assert.equal(editDraft.aspects[0].transitPlanet, null);
  assert.equal(editDraft.eclipses.length, 1);
  assert.equal(editDraft.eclipses[0].eclipseType, null);
  const editRoundTrip = toTransitAnalysis(toTransitAnalysisFormData(editDraft));
  assert.equal(editRoundTrip.success, true);
  if (editRoundTrip.success) {
    assert.deepEqual(editRoundTrip.data.positions, [jupiterLeo5]);
    assert.deepEqual(editRoundTrip.data.aspects, []);
    assert.deepEqual(editRoundTrip.data.eclipses, []);
  }

  const fullEditDraft = transitAnalysisToDraft({
    analysisDate: "2026-09-01",
    positions: [jupiterLeo5],
    aspects: [saturnSquareMoon],
    eclipses: [solarLeoAquarius],
  });
  assert.equal(fullEditDraft.positions.length, 1);
  assert.equal(fullEditDraft.aspects.length, 1);
  assert.equal(fullEditDraft.eclipses.length, 1);
  assert.equal(fullEditDraft.aspects[0].transitPlanet, "saturn");
}

run();
console.log("transit analysis domain tests ok");
