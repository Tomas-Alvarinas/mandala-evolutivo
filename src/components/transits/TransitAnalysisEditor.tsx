"use client";

import { type Dispatch, type ReactNode, type SetStateAction } from "react";
import {
  AspectSelect,
  ChartPointSelect,
  HouseSelect,
  SignSelect,
} from "@/components/astrology/selects";
import { TransitPlanetSelect, EclipseTypeSelect } from "@/components/transits/selects";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  emptyAspectDraft,
  emptyEclipseDraft,
  emptyPositionDraft,
  type TransitAnalysisDraft,
  type TransitPlanetId,
} from "@/lib/transits";

type TransitAnalysisEditorProps = {
  value: TransitAnalysisDraft;
  onChange: Dispatch<SetStateAction<TransitAnalysisDraft>>;
  onDirty?: () => void;
};

export function TransitAnalysisEditor({
  value,
  onChange,
  onDirty,
}: TransitAnalysisEditorProps) {
  function updateDraft(
    updater: (current: TransitAnalysisDraft) => TransitAnalysisDraft,
  ) {
    onDirty?.();
    onChange(updater);
  }

  function usedTransitPlanetsExcept(uiId: string): TransitPlanetId[] {
    return value.positions.flatMap((position) =>
      position.uiId !== uiId && position.planet !== null ? [position.planet] : [],
    );
  }

  return (
    <div>
      <EditorSubsection title="Fecha del período">
        <div className="max-w-xs">
          <Input
            id="transit-analysis-date"
            label="Fecha"
            type="date"
            value={value.analysisDate}
            onChange={(event) => {
              onDirty?.();
              onChange((current) => ({
                ...current,
                analysisDate: event.target.value,
              }));
            }}
          />
        </div>
      </EditorSubsection>

      <EditorSubsection title="Tránsitos">
        <div className="mb-1 hidden grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-3 text-xs font-medium tracking-wide text-muted uppercase sm:grid">
          <span>Planeta</span>
          <span>Signo</span>
          <span>Casa</span>
          <span className="sr-only">Acciones</span>
        </div>
        <div>
          {value.positions.map((position) => (
            <div
              key={position.uiId}
              className="grid grid-cols-1 items-center gap-2 border-b border-border/70 py-3 last:border-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
            >
              <TransitPlanetSelect
                id={`transit-position-${position.uiId}-planet`}
                value={position.planet}
                onChange={(planet) => {
                  updateDraft((current) => ({
                    ...current,
                    positions: current.positions.map((entry) =>
                      entry.uiId === position.uiId ? { ...entry, planet } : entry,
                    ),
                  }));
                }}
                disabledIds={usedTransitPlanetsExcept(position.uiId)}
                aria-label="Planeta en tránsito"
              />
              <SignSelect
                id={`transit-position-${position.uiId}-sign`}
                value={position.sign}
                onChange={(sign) => {
                  updateDraft((current) => ({
                    ...current,
                    positions: current.positions.map((entry) =>
                      entry.uiId === position.uiId ? { ...entry, sign } : entry,
                    ),
                  }));
                }}
                aria-label="Signo del tránsito"
              />
              <HouseSelect
                id={`transit-position-${position.uiId}-house`}
                value={position.natalHouse}
                onChange={(natalHouse) => {
                  updateDraft((current) => ({
                    ...current,
                    positions: current.positions.map((entry) =>
                      entry.uiId === position.uiId
                        ? { ...entry, natalHouse }
                        : entry,
                    ),
                  }));
                }}
                aria-label="Casa natal"
              />
              <Button
                type="button"
                variant="ghost"
                className="justify-self-start px-3 sm:justify-self-auto"
                aria-label="Eliminar tránsito"
                onClick={() => {
                  updateDraft((current) => {
                    const remaining = current.positions.filter(
                      (entry) => entry.uiId !== position.uiId,
                    );

                    return {
                      ...current,
                      positions:
                        remaining.length === 0
                          ? [emptyPositionDraft()]
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
                positions: [...current.positions, emptyPositionDraft()],
              }));
            }}
          >
            Agregar otro tránsito
          </Button>
        </div>
      </EditorSubsection>

      <EditorSubsection title="Aspectos">
        <div className="mb-1 hidden grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-3 text-xs font-medium tracking-wide text-muted uppercase sm:grid">
          <span>Planeta</span>
          <span>Aspecto</span>
          <span>Punto natal</span>
          <span className="sr-only">Acciones</span>
        </div>
        <div>
          {value.aspects.map((aspect) => (
              <div
                key={aspect.uiId}
                className="grid grid-cols-1 items-center gap-2 border-b border-border/70 py-3 last:border-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
              >
                <TransitPlanetSelect
                  id={`transit-aspect-${aspect.uiId}-planet`}
                  value={aspect.transitPlanet}
                  onChange={(transitPlanet) => {
                    updateDraft((current) => ({
                      ...current,
                      aspects: current.aspects.map((entry) =>
                        entry.uiId === aspect.uiId
                          ? { ...entry, transitPlanet }
                          : entry,
                      ),
                    }));
                  }}
                  aria-label="Planeta en tránsito para el aspecto"
                />
                <AspectSelect
                  id={`transit-aspect-${aspect.uiId}-aspect`}
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
                <ChartPointSelect
                  id={`transit-aspect-${aspect.uiId}-natal-point`}
                  value={aspect.natalPoint}
                  onChange={(natalPoint) => {
                    updateDraft((current) => ({
                      ...current,
                      aspects: current.aspects.map((entry) =>
                        entry.uiId === aspect.uiId
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
            ))}
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

      <EditorSubsection title="Eclipses">
        <div>
          {value.eclipses.map((eclipse) => (
            <div
              key={eclipse.uiId}
              className="border-b border-border/70 py-3 last:border-0"
            >
              <div className="max-w-xs">
                <p className="mb-1 text-xs font-medium tracking-wide text-muted uppercase">
                  Tipo
                </p>
                <EclipseTypeSelect
                  id={`transit-eclipse-${eclipse.uiId}-type`}
                  value={eclipse.eclipseType}
                  onChange={(eclipseType) => {
                    updateDraft((current) => ({
                      ...current,
                      eclipses: current.eclipses.map((entry) =>
                        entry.uiId === eclipse.uiId
                          ? { ...entry, eclipseType }
                          : entry,
                      ),
                    }));
                  }}
                />
              </div>

              <div className="mt-6">
                <div className="mb-1 hidden grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3 text-xs font-medium tracking-wide text-muted uppercase sm:grid">
                  <span>Signo</span>
                  <span>Casa</span>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                  <SignSelect
                    id={`transit-eclipse-${eclipse.uiId}-sign-a`}
                    value={eclipse.signA}
                    onChange={(signA) => {
                      updateDraft((current) => ({
                        ...current,
                        eclipses: current.eclipses.map((entry) =>
                          entry.uiId === eclipse.uiId
                            ? { ...entry, signA }
                            : entry,
                        ),
                      }));
                    }}
                    aria-label="Signo A del eclipse"
                  />
                  <HouseSelect
                    id={`transit-eclipse-${eclipse.uiId}-house-a`}
                    value={eclipse.natalHouseA}
                    onChange={(natalHouseA) => {
                      updateDraft((current) => ({
                        ...current,
                        eclipses: current.eclipses.map((entry) =>
                          entry.uiId === eclipse.uiId
                            ? { ...entry, natalHouseA }
                            : entry,
                        ),
                      }));
                    }}
                    aria-label="Casa natal A del eclipse"
                  />
                  <SignSelect
                    id={`transit-eclipse-${eclipse.uiId}-sign-b`}
                    value={eclipse.signB}
                    onChange={(signB) => {
                      updateDraft((current) => ({
                        ...current,
                        eclipses: current.eclipses.map((entry) =>
                          entry.uiId === eclipse.uiId
                            ? { ...entry, signB }
                            : entry,
                        ),
                      }));
                    }}
                    aria-label="Signo B del eclipse"
                  />
                  <HouseSelect
                    id={`transit-eclipse-${eclipse.uiId}-house-b`}
                    value={eclipse.natalHouseB}
                    onChange={(natalHouseB) => {
                      updateDraft((current) => ({
                        ...current,
                        eclipses: current.eclipses.map((entry) =>
                          entry.uiId === eclipse.uiId
                            ? { ...entry, natalHouseB }
                            : entry,
                        ),
                      }));
                    }}
                    aria-label="Casa natal B del eclipse"
                  />
                </div>
              </div>

              <div className="mt-3">
                <Button
                  type="button"
                  variant="ghost"
                  className="justify-self-start px-3 sm:w-auto"
                  aria-label="Eliminar eclipse"
                  onClick={() => {
                    updateDraft((current) => {
                      const remaining = current.eclipses.filter(
                        (entry) => entry.uiId !== eclipse.uiId,
                      );

                      return {
                        ...current,
                        eclipses:
                          remaining.length === 0
                            ? [emptyEclipseDraft()]
                            : remaining,
                      };
                    });
                  }}
                >
                  Eliminar
                </Button>
              </div>
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
                eclipses: [...current.eclipses, emptyEclipseDraft()],
              }));
            }}
          >
            Agregar otro eclipse
          </Button>
        </div>
      </EditorSubsection>
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
