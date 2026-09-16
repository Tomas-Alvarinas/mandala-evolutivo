"use client";

import { type Dispatch, type ReactNode, type SetStateAction } from "react";
import {
  AspectSelect,
  ChartPointSelect,
  HouseSelect,
  RulerPlanetSelect,
  SignSelect,
} from "@/components/astrology/selects";
import { SolarReturnPointSelect } from "@/components/solar-returns/selects";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
  SOLAR_RETURN_BODIES,
  emptyAspectDraft,
  emptyNatalContactDraft,
  getSolarReturnPointLabel,
  type SolarReturnDraft,
  type SolarReturnPositionFormData,
} from "@/lib/solar-returns";
import type { HouseNumber, ZodiacSignId } from "@/lib/astrology";

type SolarReturnEditorProps = {
  value: SolarReturnDraft;
  onChange: Dispatch<SetStateAction<SolarReturnDraft>>;
  onDirty?: () => void;
};

export function SolarReturnEditor({
  value,
  onChange,
  onDirty,
}: SolarReturnEditorProps) {
  function updateDraft(updater: (current: SolarReturnDraft) => SolarReturnDraft) {
    onDirty?.();
    onChange(updater);
  }

  function updatePosition(
    point: SolarReturnPositionFormData["point"],
    patch: Partial<SolarReturnPositionFormData>,
  ) {
    updateDraft((current) => ({
      ...current,
      positions: current.positions.map((position) =>
        position.point === point ? { ...position, ...patch } : position,
      ),
    }));
  }

  function parseElementCount(raw: string): number {
    if (raw.trim() === "") {
      return 0;
    }

    return Number(raw);
  }

  return (
    <div>
      <EditorSubsection title="Período">
        <div className="grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="solar-return-period-start"
            label="Desde"
            type="date"
            value={value.periodStart}
            onChange={(event) => {
              updateDraft((current) => ({
                ...current,
                periodStart: event.target.value,
              }));
            }}
          />
          <Input
            id="solar-return-period-end"
            label="Hasta"
            type="date"
            value={value.periodEnd}
            onChange={(event) => {
              updateDraft((current) => ({
                ...current,
                periodEnd: event.target.value,
              }));
            }}
          />
        </div>
        <div className="mt-6 max-w-2xl">
          <Textarea
            id="solar-return-notes"
            label="Notas profesionales"
            optional
            rows={4}
            value={value.professionalNotes}
            onChange={(event) => {
              updateDraft((current) => ({
                ...current,
                professionalNotes: event.target.value,
              }));
            }}
          />
        </div>
      </EditorSubsection>

      <EditorSubsection title="Ascendente y Medio Cielo">
        <AngleBlock
          title="Ascendente"
          point="ascendant"
          sign={value.ascendant.sign}
          natalOverlayHouse={value.ascendant.natalOverlayHouse}
          onSignChange={(sign) => {
            updateDraft((current) => ({
              ...current,
              ascendant: { ...current.ascendant, sign },
            }));
          }}
          onHouseChange={(natalOverlayHouse) => {
            updateDraft((current) => ({
              ...current,
              ascendant: { ...current.ascendant, natalOverlayHouse },
            }));
          }}
        />

        <div className="mt-6 max-w-xs">
          <p className="mb-1 text-xs font-medium tracking-wide text-muted uppercase">
            Regente del Ascendente
          </p>
          <RulerPlanetSelect
            id="solar-return-ascendant-ruler"
            value={value.ascendantRuler}
            placeholder="Regente"
            aria-label="Regente del Ascendente"
            onChange={(ascendantRuler) => {
              updateDraft((current) => ({
                ...current,
                ascendantRuler,
              }));
            }}
          />
        </div>

        <div className="mt-8">
          <AngleBlock
            title="Medio Cielo"
            point="midheaven"
            sign={value.midheaven.sign}
            natalOverlayHouse={value.midheaven.natalOverlayHouse}
            onSignChange={(sign) => {
              updateDraft((current) => ({
                ...current,
                midheaven: { ...current.midheaven, sign },
              }));
            }}
            onHouseChange={(natalOverlayHouse) => {
              updateDraft((current) => ({
                ...current,
                midheaven: { ...current.midheaven, natalOverlayHouse },
              }));
            }}
          />
        </div>
      </EditorSubsection>

      <EditorSubsection title="Planetas">
        <div className="mb-1 hidden grid-cols-[minmax(7.5rem,9rem)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] gap-3 text-xs font-medium tracking-wide text-muted uppercase lg:grid">
          <span>Planeta</span>
          <span>Signo</span>
          <span>Casa RS</span>
          <span>Casa natal</span>
        </div>
        <div>
          {SOLAR_RETURN_BODIES.map((body) => {
            const position = value.positions.find(
              (entry) => entry.point === body.id,
            );
            const label = getSolarReturnPointLabel(body.id);

            return (
              <div
                key={body.id}
                className="grid grid-cols-1 gap-2 border-b border-border/70 py-2.5 last:border-0 sm:grid-cols-2 lg:grid-cols-[minmax(7.5rem,9rem)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-3"
              >
                <p className="text-sm font-medium text-foreground">{label}</p>
                <div className="grid grid-cols-1 gap-2 sm:col-span-1 sm:grid-cols-2 lg:contents">
                  <SignSelect
                    id={`solar-return-sign-${body.id}`}
                    value={position?.sign ?? null}
                    onChange={(sign) => updatePosition(body.id, { sign })}
                    aria-label={`${label}: signo`}
                  />
                  <HouseSelect
                    id={`solar-return-house-${body.id}`}
                    value={position?.solarReturnHouse ?? null}
                    placeholder="Casa RS"
                    onChange={(solarReturnHouse) =>
                      updatePosition(body.id, { solarReturnHouse })
                    }
                    aria-label={`${label}: casa RS`}
                  />
                  <HouseSelect
                    id={`solar-return-natal-house-${body.id}`}
                    value={position?.natalOverlayHouse ?? null}
                    placeholder="Casa natal"
                    onChange={(natalOverlayHouse) =>
                      updatePosition(body.id, { natalOverlayHouse })
                    }
                    aria-label={`${label}: casa natal`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </EditorSubsection>

      <EditorSubsection title="Aspectos de Revolución Solar">
        <div className="mb-1 hidden grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-3 text-xs font-medium tracking-wide text-muted uppercase sm:grid">
          <span>Punto RS</span>
          <span>Aspecto</span>
          <span>Punto RS</span>
          <span className="sr-only">Acciones</span>
        </div>
        <div>
          {value.aspects.map((aspect) => {
            const isSelfAspect =
              aspect.pointA !== null && aspect.pointA === aspect.pointB;

            return (
              <div
                key={aspect.uiId}
                className="flex flex-col gap-2 border-b border-border/70 py-3 last:border-0"
              >
                <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
                  <SolarReturnPointSelect
                    id={`solar-return-aspect-${aspect.uiId}-point-a`}
                    value={aspect.pointA}
                    onChange={(pointA) => {
                      updateDraft((current) => ({
                        ...current,
                        aspects: current.aspects.map((entry) =>
                          entry.uiId === aspect.uiId
                            ? {
                                ...entry,
                                pointA,
                                pointB:
                                  pointA !== null && pointA === entry.pointB
                                    ? null
                                    : entry.pointB,
                              }
                            : entry,
                        ),
                      }));
                    }}
                    aria-label="Punto RS A"
                  />
                  <AspectSelect
                    id={`solar-return-aspect-${aspect.uiId}-aspect`}
                    value={aspect.aspect}
                    onChange={(nextAspect) => {
                      updateDraft((current) => ({
                        ...current,
                        aspects: current.aspects.map((entry) =>
                          entry.uiId === aspect.uiId
                            ? { ...entry, aspect: nextAspect }
                            : entry,
                        ),
                      }));
                    }}
                  />
                  <SolarReturnPointSelect
                    id={`solar-return-aspect-${aspect.uiId}-point-b`}
                    value={aspect.pointB}
                    onChange={(pointB) => {
                      updateDraft((current) => ({
                        ...current,
                        aspects: current.aspects.map((entry) =>
                          entry.uiId === aspect.uiId
                            ? { ...entry, pointB }
                            : entry,
                        ),
                      }));
                    }}
                    disabledIds={aspect.pointA ? [aspect.pointA] : []}
                    aria-label="Punto RS B"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="justify-self-start px-3 sm:justify-self-auto"
                    aria-label="Eliminar aspecto"
                    onClick={() => {
                      updateDraft((current) => {
                        const remaining = current.aspects.filter(
                          (entry) => entry.uiId !== aspect.uiId,
                        );

                        return {
                          ...current,
                          aspects:
                            remaining.length === 0
                              ? [emptyAspectDraft()]
                              : remaining,
                        };
                      });
                    }}
                  >
                    Eliminar
                  </Button>
                </div>
                {isSelfAspect ? (
                  <p className="text-sm text-danger" role="alert">
                    Elegí dos puntos distintos para el aspecto.
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
        <div className="mt-4 pb-6">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              updateDraft((current) => ({
                ...current,
                aspects: [...current.aspects, emptyAspectDraft()],
              }));
            }}
          >
            Agregar otro aspecto
          </Button>
        </div>
      </EditorSubsection>

      <EditorSubsection title="Contactos con Carta Natal">
        <p className="mb-4 text-sm leading-relaxed text-muted">
          Ej.: Venus RS — conjunción — Saturno natal
        </p>
        <div className="mb-1 hidden grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-3 text-xs font-medium tracking-wide text-muted uppercase sm:grid">
          <span>Punto de Revolución Solar</span>
          <span>Aspecto</span>
          <span>Punto natal</span>
          <span className="sr-only">Acciones</span>
        </div>
        <div>
          {value.natalContacts.map((contact) => (
            <div
              key={contact.uiId}
              className="grid grid-cols-1 items-center gap-2 border-b border-border/70 py-3 last:border-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
            >
              <SolarReturnPointSelect
                id={`solar-return-contact-${contact.uiId}-rs-point`}
                value={contact.solarReturnPoint}
                onChange={(solarReturnPoint) => {
                  updateDraft((current) => ({
                    ...current,
                    natalContacts: current.natalContacts.map((entry) =>
                      entry.uiId === contact.uiId
                        ? { ...entry, solarReturnPoint }
                        : entry,
                    ),
                  }));
                }}
                aria-label="Punto de Revolución Solar"
              />
              <AspectSelect
                id={`solar-return-contact-${contact.uiId}-aspect`}
                value={contact.aspect}
                onChange={(nextAspect) => {
                  updateDraft((current) => ({
                    ...current,
                    natalContacts: current.natalContacts.map((entry) =>
                      entry.uiId === contact.uiId
                        ? { ...entry, aspect: nextAspect }
                        : entry,
                    ),
                  }));
                }}
              />
              <ChartPointSelect
                id={`solar-return-contact-${contact.uiId}-natal-point`}
                value={contact.natalPoint}
                onChange={(natalPoint) => {
                  updateDraft((current) => ({
                    ...current,
                    natalContacts: current.natalContacts.map((entry) =>
                      entry.uiId === contact.uiId
                        ? { ...entry, natalPoint }
                        : entry,
                    ),
                  }));
                }}
                aria-label="Punto natal"
              />
              <Button
                type="button"
                variant="ghost"
                className="justify-self-start px-3 sm:justify-self-auto"
                aria-label="Eliminar contacto"
                onClick={() => {
                  updateDraft((current) => {
                    const remaining = current.natalContacts.filter(
                      (entry) => entry.uiId !== contact.uiId,
                    );

                    return {
                      ...current,
                      natalContacts:
                        remaining.length === 0
                          ? [emptyNatalContactDraft()]
                          : remaining,
                    };
                  });
                }}
              >
                Eliminar
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-4 pb-6">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              updateDraft((current) => ({
                ...current,
                natalContacts: [...current.natalContacts, emptyNatalContactDraft()],
              }));
            }}
          >
            Agregar otro contacto
          </Button>
        </div>
      </EditorSubsection>

      <EditorSubsection title="Síntesis de elementos">
        <p className="mb-4 text-sm leading-relaxed text-muted">
          Cargá manualmente la síntesis utilizada para esta Revolución Solar.
        </p>
        <div className="grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            id="solar-return-fire"
            label="Fuego"
            type="number"
            min={0}
            step={1}
            value={String(value.elementSummary.fire)}
            onChange={(event) => {
              const fire = parseElementCount(event.target.value);
              updateDraft((current) => ({
                ...current,
                elementSummary: { ...current.elementSummary, fire },
              }));
            }}
          />
          <Input
            id="solar-return-earth"
            label="Tierra"
            type="number"
            min={0}
            step={1}
            value={String(value.elementSummary.earth)}
            onChange={(event) => {
              const earth = parseElementCount(event.target.value);
              updateDraft((current) => ({
                ...current,
                elementSummary: { ...current.elementSummary, earth },
              }));
            }}
          />
          <Input
            id="solar-return-air"
            label="Aire"
            type="number"
            min={0}
            step={1}
            value={String(value.elementSummary.air)}
            onChange={(event) => {
              const air = parseElementCount(event.target.value);
              updateDraft((current) => ({
                ...current,
                elementSummary: { ...current.elementSummary, air },
              }));
            }}
          />
          <Input
            id="solar-return-water"
            label="Agua"
            type="number"
            min={0}
            step={1}
            value={String(value.elementSummary.water)}
            onChange={(event) => {
              const water = parseElementCount(event.target.value);
              updateDraft((current) => ({
                ...current,
                elementSummary: { ...current.elementSummary, water },
              }));
            }}
          />
        </div>
      </EditorSubsection>
    </div>
  );
}

function AngleBlock({
  title,
  point,
  sign,
  natalOverlayHouse,
  onSignChange,
  onHouseChange,
}: {
  title: string;
  point: "ascendant" | "midheaven";
  sign: ZodiacSignId | null;
  natalOverlayHouse: HouseNumber | null;
  onSignChange: (sign: ZodiacSignId | null) => void;
  onHouseChange: (house: HouseNumber | null) => void;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-foreground">{title}</p>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <SignSelect
          id={`solar-return-${point}-sign`}
          value={sign}
          onChange={onSignChange}
          aria-label={`${title}: signo`}
        />
        <HouseSelect
          id={`solar-return-${point}-natal-house`}
          value={natalOverlayHouse}
          placeholder="Casa natal"
          onChange={onHouseChange}
          aria-label={`${title}: casa natal`}
        />
      </div>
    </div>
  );
}

function EditorSubsection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-border/70 pt-8 first:border-t-0 first:pt-0">
      <h3 className="text-base font-medium tracking-wide text-foreground uppercase">
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}
