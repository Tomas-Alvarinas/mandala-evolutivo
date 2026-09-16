"use client";

import type { Dispatch, ReactNode, SetStateAction } from "react";
import {
  ASTROLOGICAL_BODIES,
  CHART_CONFIGURATIONS,
  HOUSE_NUMBERS,
  canAddConfigurationPoint,
  canRemoveConfigurationPoint,
  createConfigurationPointSlots,
  resizeConfigurationPointSlots,
  type AstrologicalBodyId,
  type ConfigurationId,
  type HouseNumber,
  type RulerPlanetId,
  type ZodiacSignId,
} from "@/lib/astrology";
import { AnglePositionRow } from "@/components/natal-chart/AnglePositionRow";
import { AspectRow } from "@/components/natal-chart/AspectRow";
import { AstrologicalPositionRow } from "@/components/natal-chart/AstrologicalPositionRow";
import { ConfigurationRow } from "@/components/natal-chart/ConfigurationRow";
import { HouseRulerRow } from "@/components/natal-chart/HouseRulerRow";
import { Button } from "@/components/ui/Button";
import {
  createUiId,
  type NatalChartDraft,
} from "@/lib/clients/natal-chart-form";

type NatalChartEditorProps = {
  natalChart: NatalChartDraft;
  onChange: Dispatch<SetStateAction<NatalChartDraft>>;
  onDirty?: () => void;
};

export function NatalChartEditor({
  natalChart,
  onChange,
  onDirty,
}: NatalChartEditorProps) {
  const usedConfigurationIds = natalChart.configurations.map(
    (configuration) => configuration.type,
  );
  const canAddConfiguration =
    usedConfigurationIds.length < CHART_CONFIGURATIONS.length;

  const houseRulers = natalChart.houseRulers ?? [];
  const usedHouseNumbers = houseRulers.flatMap((ruler) =>
    ruler.house === null ? [] : [ruler.house],
  );
  const canAddHouseRuler = houseRulers.length < HOUSE_NUMBERS.length;

  function updateChart(updater: (current: NatalChartDraft) => NatalChartDraft) {
    onDirty?.();
    onChange(updater);
  }

  function updatePosition(
    point: AstrologicalBodyId,
    patch: { sign?: ZodiacSignId | null; house?: HouseNumber | null },
  ) {
    updateChart((current) => ({
      ...current,
      positions: current.positions.map((position) =>
        position.point === point ? { ...position, ...patch } : position,
      ),
    }));
  }

  return (
    <div>
      <EditorSubsection title="Posiciones">
        <div className="mb-1 hidden grid-cols-[minmax(7.5rem,9rem)_minmax(0,1fr)_minmax(0,1fr)] gap-3 text-xs font-medium tracking-wide text-muted uppercase sm:grid">
          <span>Elemento</span>
          <span>Signo</span>
          <span>Casa</span>
        </div>
        <div>
          {ASTROLOGICAL_BODIES.map((body) => {
            const position = natalChart.positions.find(
              (entry) => entry.point === body.id,
            );

            return (
              <AstrologicalPositionRow
                key={body.id}
                point={body.id}
                sign={position?.sign ?? null}
                house={position?.house ?? null}
                onSignChange={(sign) => updatePosition(body.id, { sign })}
                onHouseChange={(house) => updatePosition(body.id, { house })}
              />
            );
          })}
        </div>
      </EditorSubsection>

      <EditorSubsection title="Ángulos">
        <div className="mb-1 hidden grid-cols-[minmax(7.5rem,9rem)_minmax(0,1fr)] gap-3 text-xs font-medium tracking-wide text-muted uppercase sm:grid">
          <span>Ángulo</span>
          <span>Signo</span>
        </div>
        <div>
          <AnglePositionRow
            angle="ascendant"
            sign={natalChart.ascendant}
            onSignChange={(sign) => {
              updateChart((current) => ({
                ...current,
                ascendant: sign,
              }));
            }}
          />
          <AnglePositionRow
            angle="midheaven"
            sign={natalChart.midheaven}
            onSignChange={(sign) => {
              updateChart((current) => ({
                ...current,
                midheaven: sign,
              }));
            }}
          />
        </div>
      </EditorSubsection>

      <EditorSubsection title="Aspectos">
        {natalChart.aspects.length === 0 ? (
          <p className="text-sm text-muted">Sin aspectos cargados.</p>
        ) : (
          <div>
            <div className="mb-1 hidden grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-2 text-xs font-medium tracking-wide text-muted uppercase sm:grid">
              <span>Punto 1</span>
              <span>Aspecto</span>
              <span>Punto 2</span>
              <span className="sr-only">Acciones</span>
            </div>
            {natalChart.aspects.map((aspect) => (
              <AspectRow
                key={aspect.uiId}
                pointA={aspect.pointA}
                aspect={aspect.aspect}
                pointB={aspect.pointB}
                onPointAChange={(pointA) => {
                  updateChart((current) => ({
                    ...current,
                    aspects: current.aspects.map((entry) =>
                      entry.uiId === aspect.uiId ? { ...entry, pointA } : entry,
                    ),
                  }));
                }}
                onAspectChange={(nextAspect) => {
                  updateChart((current) => ({
                    ...current,
                    aspects: current.aspects.map((entry) =>
                      entry.uiId === aspect.uiId
                        ? { ...entry, aspect: nextAspect }
                        : entry,
                    ),
                  }));
                }}
                onPointBChange={(pointB) => {
                  updateChart((current) => ({
                    ...current,
                    aspects: current.aspects.map((entry) =>
                      entry.uiId === aspect.uiId ? { ...entry, pointB } : entry,
                    ),
                  }));
                }}
                onRemove={() => {
                  updateChart((current) => ({
                    ...current,
                    aspects: current.aspects.filter(
                      (entry) => entry.uiId !== aspect.uiId,
                    ),
                  }));
                }}
              />
            ))}
          </div>
        )}
        <div className="mt-4 pb-6">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              updateChart((current) => ({
                ...current,
                aspects: [
                  ...current.aspects,
                  {
                    uiId: createUiId(),
                    pointA: null,
                    aspect: null,
                    pointB: null,
                  },
                ],
              }));
            }}
          >
            Agregar aspecto
          </Button>
        </div>
      </EditorSubsection>

      <EditorSubsection title="Regentes">
        {houseRulers.length === 0 ? (
          <p className="text-sm text-muted">Sin regentes cargados.</p>
        ) : (
          <div>
            <div className="mb-1 hidden grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-2 text-xs font-medium tracking-wide text-muted uppercase sm:grid">
              <span>Casa</span>
              <span>Planeta</span>
              <span>Signo</span>
              <span className="sr-only">Acciones</span>
            </div>
            {houseRulers.map((ruler) => {
              const disabledHouseNumbers = usedHouseNumbers.filter(
                (house) => house !== ruler.house,
              );

              return (
                <HouseRulerRow
                  key={ruler.uiId}
                  house={ruler.house}
                  planet={ruler.planet}
                  sign={ruler.sign}
                  disabledHouseNumbers={disabledHouseNumbers}
                  onHouseChange={(house) => {
                    updateChart((current) => ({
                      ...current,
                      houseRulers: current.houseRulers.map((entry) =>
                        entry.uiId === ruler.uiId
                          ? { ...entry, house }
                          : entry,
                      ),
                    }));
                  }}
                  onPlanetChange={(planet: RulerPlanetId | null) => {
                    updateChart((current) => ({
                      ...current,
                      houseRulers: current.houseRulers.map((entry) =>
                        entry.uiId === ruler.uiId
                          ? { ...entry, planet }
                          : entry,
                      ),
                    }));
                  }}
                  onSignChange={(sign) => {
                    updateChart((current) => ({
                      ...current,
                      houseRulers: current.houseRulers.map((entry) =>
                        entry.uiId === ruler.uiId ? { ...entry, sign } : entry,
                      ),
                    }));
                  }}
                  onRemove={() => {
                    updateChart((current) => ({
                      ...current,
                      houseRulers: current.houseRulers.filter(
                        (entry) => entry.uiId !== ruler.uiId,
                      ),
                    }));
                  }}
                />
              );
            })}
          </div>
        )}
        <div className="mt-4 pb-6">
          <Button
            type="button"
            variant="secondary"
            disabled={!canAddHouseRuler}
            onClick={() => {
              updateChart((current) => ({
                ...current,
                houseRulers: [
                  ...current.houseRulers,
                  {
                    uiId: createUiId(),
                    house: null,
                    planet: null,
                    sign: null,
                  },
                ],
              }));
            }}
          >
            Agregar regente
          </Button>
        </div>
      </EditorSubsection>

      <EditorSubsection title="Configuraciones">
        {natalChart.configurations.length === 0 ? (
          <p className="text-sm text-muted">Sin configuraciones cargadas.</p>
        ) : (
          <div>
            {natalChart.configurations.map((configuration) => {
              const disabledIds = usedConfigurationIds.filter(
                (id) => id !== configuration.type,
              );

              return (
                <ConfigurationRow
                  key={configuration.uiId}
                  type={configuration.type}
                  points={configuration.points}
                  disabledTypeIds={disabledIds}
                  onTypeChange={(type: ConfigurationId) => {
                    updateChart((current) => ({
                      ...current,
                      configurations: current.configurations.map((entry) =>
                        entry.uiId === configuration.uiId
                          ? {
                              ...entry,
                              type,
                              points: resizeConfigurationPointSlots(
                                type,
                                entry.points,
                              ),
                            }
                          : entry,
                      ),
                    }));
                  }}
                  onPointChange={(index, point) => {
                    updateChart((current) => ({
                      ...current,
                      configurations: current.configurations.map((entry) =>
                        entry.uiId === configuration.uiId
                          ? {
                              ...entry,
                              points: entry.points.map(
                                (currentPoint, pointIndex) =>
                                  pointIndex === index ? point : currentPoint,
                              ),
                            }
                          : entry,
                      ),
                    }));
                  }}
                  onAddPoint={() => {
                    updateChart((current) => ({
                      ...current,
                      configurations: current.configurations.map((entry) => {
                        if (
                          entry.uiId !== configuration.uiId ||
                          !canAddConfigurationPoint(
                            entry.type,
                            entry.points.length,
                          )
                        ) {
                          return entry;
                        }

                        return {
                          ...entry,
                          points: [...entry.points, null],
                        };
                      }),
                    }));
                  }}
                  onRemovePoint={(index) => {
                    updateChart((current) => ({
                      ...current,
                      configurations: current.configurations.map((entry) => {
                        if (
                          entry.uiId !== configuration.uiId ||
                          !canRemoveConfigurationPoint(
                            entry.type,
                            entry.points.length,
                          )
                        ) {
                          return entry;
                        }

                        return {
                          ...entry,
                          points: entry.points.filter(
                            (_point, pointIndex) => pointIndex !== index,
                          ),
                        };
                      }),
                    }));
                  }}
                  onRemove={() => {
                    updateChart((current) => ({
                      ...current,
                      configurations: current.configurations.filter(
                        (entry) => entry.uiId !== configuration.uiId,
                      ),
                    }));
                  }}
                />
              );
            })}
          </div>
        )}
        <div className="mt-4 pb-6">
          <Button
            type="button"
            variant="secondary"
            disabled={!canAddConfiguration}
            onClick={() => {
              updateChart((current) => {
                const selectedIds = current.configurations.map(
                  (configuration) => configuration.type,
                );
                const nextConfiguration = CHART_CONFIGURATIONS.find(
                  (configuration) => !selectedIds.includes(configuration.id),
                );

                if (!nextConfiguration) {
                  return current;
                }

                return {
                  ...current,
                  configurations: [
                    ...current.configurations,
                    {
                      uiId: createUiId(),
                      type: nextConfiguration.id,
                      points: createConfigurationPointSlots(
                        nextConfiguration.id,
                      ),
                    },
                  ],
                };
              });
            }}
          >
            Agregar configuración
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
