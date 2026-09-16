import assert from "node:assert/strict";
import { CHART_POINTS, type HouseNumber } from "@/lib/astrology";
import {
  SOLAR_RETURN_BODY_IDS,
  SOLAR_RETURN_EXCLUDED_POINTS,
  SOLAR_RETURN_POINT_IDS,
  commitSolarReturnAspect,
  commitSolarReturnNatalAspect,
  createEmptySolarReturnDraft,
  getLatestSolarReturnSummary,
  isExcludedSolarReturnPoint,
  isSolarReturnAngleId,
  isSolarReturnAscendantRuler,
  isSolarReturnBodyId,
  isSolarReturnPointId,
  isValidSolarReturnPeriod,
  SELF_ASPECT_ERROR,
  DUPLICATE_SOLAR_RETURN_NATAL_CONTACT_ERROR,
  toSolarReturn,
  toSolarReturnFormData,
  type SolarReturnFormData,
  solarReturnToDraft,
} from "@/lib/solar-returns";

function completeForm(
  overrides: Partial<SolarReturnFormData> = {},
): SolarReturnFormData {
  const draft = createEmptySolarReturnDraft();

  return {
    ...toSolarReturnFormData(draft),
    periodStart: "2026-03-12",
    periodEnd: "2027-03-12",
    ascendantRuler: "mars",
    ascendant: { sign: "aries", natalOverlayHouse: 4 },
    midheaven: { sign: "capricorn", natalOverlayHouse: 1 },
    positions: SOLAR_RETURN_BODY_IDS.map((point, index) => ({
      point,
      sign: "capricorn",
      solarReturnHouse: (((index % 12) + 1) as HouseNumber),
      natalOverlayHouse: ((((index + 3) % 12) + 1) as HouseNumber),
    })),
    aspects: [],
    natalContacts: [],
    elementSummary: { fire: 2, earth: 5, air: 1, water: 3 },
    ...overrides,
  };
}

function run() {
  assert.equal(SOLAR_RETURN_POINT_IDS.length, 13);
  assert.equal(SOLAR_RETURN_BODY_IDS.length, 11);
  assert.equal(isSolarReturnPointId("chiron"), true);
  assert.equal(isSolarReturnBodyId("chiron"), true);
  assert.equal(isSolarReturnPointId("ascendant"), true);
  assert.equal(isSolarReturnPointId("midheaven"), true);
  assert.equal(isSolarReturnBodyId("ascendant"), false);
  assert.equal(isSolarReturnPointId("northNode"), false);
  assert.equal(isSolarReturnPointId("southNode"), false);
  assert.equal(isExcludedSolarReturnPoint("northNode"), true);
  assert.equal(isExcludedSolarReturnPoint("southNode"), true);
  assert.deepEqual([...SOLAR_RETURN_EXCLUDED_POINTS], ["northNode", "southNode"]);

  assert.equal(CHART_POINTS.length, 15);
  assert.equal(isSolarReturnPointId("northNode") === false, true);
  for (const point of CHART_POINTS) {
    assert.equal(
      point.id === "northNode" ||
        point.id === "southNode" ||
        isSolarReturnPointId(point.id),
      true,
      point.id,
    );
  }

  assert.equal(isSolarReturnAngleId("ascendant"), true);
  assert.equal(isSolarReturnAscendantRuler("mars"), true);
  assert.equal(isSolarReturnAscendantRuler("chiron"), false);
  assert.equal(isSolarReturnAscendantRuler("northNode"), false);
  assert.equal(isSolarReturnAscendantRuler("ascendant"), false);

  assert.equal(
    isValidSolarReturnPeriod({
      periodStart: "2026-03-12",
      periodEnd: "2027-03-12",
    }),
    true,
  );
  assert.equal(
    isValidSolarReturnPeriod({
      periodStart: "2026-03-12",
      periodEnd: "2026-03-12",
    }),
    false,
  );
  assert.equal(
    isValidSolarReturnPeriod({
      periodStart: "2027-03-12",
      periodEnd: "2026-03-12",
    }),
    false,
  );
  assert.equal(
    isValidSolarReturnPeriod({
      periodStart: "12/03/2026",
      periodEnd: "2027-03-12",
    }),
    false,
  );

  const parsed = toSolarReturn(completeForm());
  assert.equal(parsed.success, true);
  if (!parsed.success) {
    throw new Error("expected a valid solar return");
  }
  assert.equal(parsed.data.positions.length, 13);
  const ascendant = parsed.data.positions.find(
    (position) => position.point === "ascendant",
  );
  const venus = parsed.data.positions.find(
    (position) => position.point === "venus",
  );
  assert.equal(ascendant?.solarReturnHouse, null);
  assert.equal(ascendant?.natalOverlayHouse, 4);
  assert.equal(venus?.solarReturnHouse, 4);
  assert.equal(venus?.natalOverlayHouse, 7);
  assert.equal(parsed.data.elementSummary.earth, 5);
  assert.equal(parsed.data.professionalNotes, null);

  const missingOverlay = completeForm({
    ascendant: { sign: "aries", natalOverlayHouse: null },
  });
  const missingOverlayResult = toSolarReturn(missingOverlay);
  assert.equal(missingOverlayResult.success, false);

  const bodyWithoutRsHouse = completeForm({
    positions: completeForm().positions.map((position) =>
      position.point === "venus"
        ? { ...position, solarReturnHouse: null }
        : position,
    ),
  });
  assert.equal(toSolarReturn(bodyWithoutRsHouse).success, false);

  const duplicatePositions = completeForm({
    positions: completeForm().positions.map((position, index) =>
      index === 1 ? { ...position, point: "sun" } : position,
    ),
  });
  const duplicatePositionResult = toSolarReturn(duplicatePositions);
  assert.equal(duplicatePositionResult.success, false);

  const selfAspect = commitSolarReturnAspect([], {
    pointA: "venus",
    aspect: "conjunction",
    pointB: "venus",
  });
  assert.equal(selfAspect.success, false);
  if (!selfAspect.success) {
    assert.equal(selfAspect.error, SELF_ASPECT_ERROR);
  }

  const firstAspect = commitSolarReturnAspect([], {
    pointA: "venus",
    aspect: "conjunction",
    pointB: "saturn",
  });
  assert.equal(firstAspect.success, true);
  if (!firstAspect.success) {
    throw new Error("expected aspect");
  }
  const duplicateAspect = commitSolarReturnAspect([firstAspect.item], {
    pointA: "venus",
    aspect: "conjunction",
    pointB: "saturn",
  });
  assert.equal(duplicateAspect.success, false);

  const natalContact = commitSolarReturnNatalAspect([], {
    solarReturnPoint: "venus",
    aspect: "conjunction",
    natalPoint: "saturn",
  });
  assert.equal(natalContact.success, true);
  if (!natalContact.success) {
    throw new Error("expected natal contact");
  }
  const nodeContact = commitSolarReturnNatalAspect([], {
    solarReturnPoint: "sun",
    aspect: "square",
    natalPoint: "northNode",
  });
  assert.equal(nodeContact.success, true);
  const duplicateContact = commitSolarReturnNatalAspect([natalContact.item], {
    solarReturnPoint: "venus",
    aspect: "conjunction",
    natalPoint: "saturn",
  });
  assert.equal(duplicateContact.success, false);

  const invalidRuler = toSolarReturn(
    completeForm({
      ascendantRuler: "chiron" as unknown as SolarReturnFormData["ascendantRuler"],
    }),
  );
  assert.equal(invalidRuler.success, false);

  const negativeElements = toSolarReturn(
    completeForm({
      elementSummary: { fire: -1, earth: 0, air: 0, water: 0 },
    }),
  );
  assert.equal(negativeElements.success, false);

  const floatElements = toSolarReturn(
    completeForm({
      elementSummary: { fire: 1.5, earth: 0, air: 0, water: 0 },
    }),
  );
  assert.equal(floatElements.success, false);

  const withNotes = toSolarReturn(
    completeForm({ professionalNotes: "  foco en casa 10  " }),
  );
  assert.equal(withNotes.success, true);
  if (withNotes.success) {
    assert.equal(withNotes.data.professionalNotes, "foco en casa 10");
    assert.equal(withNotes.data.periodStart, "2026-03-12");
    assert.equal(withNotes.data.periodEnd, "2027-03-12");
  }

  const reversedAspect = commitSolarReturnAspect(
    [{ pointA: "venus", aspect: "conjunction", pointB: "saturn" }],
    { pointA: "saturn", aspect: "conjunction", pointB: "venus" },
  );
  assert.equal(reversedAspect.success, true);

  for (const point of CHART_POINTS) {
    const accepted = commitSolarReturnNatalAspect([], {
      solarReturnPoint: "venus",
      aspect: "trine",
      natalPoint: point.id,
    });
    assert.equal(accepted.success, true, point.id);
  }

  const payload = toSolarReturn(
    completeForm({
      aspects: [{ pointA: "venus", aspect: "conjunction", pointB: "saturn" }],
      natalContacts: [
        { solarReturnPoint: "venus", aspect: "conjunction", natalPoint: "saturn" },
      ],
    }),
  );
  assert.equal(payload.success, true);
  if (!payload.success) {
    throw new Error("expected create payload");
  }
  assert.equal(payload.data.positions.length, 13);
  assert.equal(
    payload.data.positions.filter((position) => position.solarReturnHouse === null)
      .length,
    2,
  );
  assert.equal(payload.data.aspects.length, 1);
  assert.equal(payload.data.natalContacts.length, 1);
  assert.deepEqual(payload.data.elementSummary, {
    fire: 2,
    earth: 5,
    air: 1,
    water: 3,
  });

  const emptyContactSkipped = toSolarReturn(
    completeForm({
      natalContacts: [
        { solarReturnPoint: null, aspect: null, natalPoint: null },
      ],
    }),
  );
  assert.equal(emptyContactSkipped.success, true);
  if (emptyContactSkipped.success) {
    assert.deepEqual(emptyContactSkipped.data.natalContacts, []);
  }

  const emptyAspectSkipped = toSolarReturn(
    completeForm({
      aspects: [{ pointA: null, aspect: null, pointB: null }],
    }),
  );
  assert.equal(emptyAspectSkipped.success, true);
  if (emptyAspectSkipped.success) {
    assert.deepEqual(emptyAspectSkipped.data.aspects, []);
  }

  const partialContact = toSolarReturn(
    completeForm({
      natalContacts: [
        { solarReturnPoint: "venus", aspect: null, natalPoint: null },
      ],
    }),
  );
  assert.equal(partialContact.success, false);
  if (!partialContact.success) {
    assert.equal(
      partialContact.error,
      "Completá o eliminá los contactos incompletos.",
    );
  }

  const partialAspect = toSolarReturn(
    completeForm({
      aspects: [{ pointA: "venus", aspect: "conjunction", pointB: null }],
    }),
  );
  assert.equal(partialAspect.success, false);
  if (!partialAspect.success) {
    assert.equal(
      partialAspect.error,
      "Completá o eliminá los aspectos incompletos.",
    );
  }

  const emptyDraft = createEmptySolarReturnDraft();
  assert.equal(emptyDraft.natalContacts.length, 1);
  assert.equal(emptyDraft.natalContacts[0].solarReturnPoint, null);
  assert.equal(emptyDraft.aspects.length, 1);
  assert.equal(emptyDraft.aspects[0].pointA, null);

  const editFromEmptyContacts = solarReturnToDraft(
    emptyContactSkipped.success
      ? emptyContactSkipped.data
      : ((): never => {
          throw new Error("expected skipped empty contact");
        })(),
  );
  assert.equal(editFromEmptyContacts.natalContacts.length, 1);
  assert.equal(editFromEmptyContacts.natalContacts[0].solarReturnPoint, null);
  assert.equal(editFromEmptyContacts.aspects.length, 1);
  assert.equal(editFromEmptyContacts.aspects[0].pointA, null);

  const editFromPersisted = solarReturnToDraft(
    payload.success
      ? payload.data
      : ((): never => {
          throw new Error("expected persisted payload");
        })(),
  );
  assert.equal(editFromPersisted.natalContacts.length, 1);
  assert.equal(editFromPersisted.natalContacts[0].solarReturnPoint, "venus");
  assert.equal(editFromPersisted.aspects.length, 1);
  assert.equal(editFromPersisted.aspects[0].pointA, "venus");

  const duplicateContactPersist = toSolarReturn(
    completeForm({
      natalContacts: [
        {
          solarReturnPoint: "venus",
          aspect: "conjunction",
          natalPoint: "saturn",
        },
        {
          solarReturnPoint: "venus",
          aspect: "conjunction",
          natalPoint: "saturn",
        },
      ],
    }),
  );
  assert.equal(duplicateContactPersist.success, false);
  if (!duplicateContactPersist.success) {
    assert.equal(
      duplicateContactPersist.error,
      DUPLICATE_SOLAR_RETURN_NATAL_CONTACT_ERROR,
    );
  }

  const latest = getLatestSolarReturnSummary([
    {
      id: "older",
      clientId: "client-1",
      periodStart: "2026-03-12",
      periodEnd: "2027-03-12",
      createdAt: "2026-09-01T10:00:00.000Z",
      updatedAt: "2026-09-01T10:00:00.000Z",
    },
    {
      id: "newer-same-start",
      clientId: "client-1",
      periodStart: "2027-03-12",
      periodEnd: "2028-03-12",
      createdAt: "2026-09-02T10:00:00.000Z",
      updatedAt: "2026-09-02T10:00:00.000Z",
    },
    {
      id: "latest",
      clientId: "client-1",
      periodStart: "2028-03-12",
      periodEnd: "2029-03-12",
      createdAt: "2026-09-03T10:00:00.000Z",
      updatedAt: "2026-09-03T10:00:00.000Z",
    },
  ]);
  assert.equal(latest?.id, "latest");
}

run();
console.log("solar return domain tests ok");
