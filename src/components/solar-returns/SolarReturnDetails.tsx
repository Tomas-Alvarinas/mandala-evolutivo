import type { ReactNode } from "react";
import { getAstrologicalBodyLabel, getSignLabel } from "@/lib/astrology";
import {
  SOLAR_RETURN_BODY_IDS,
  formatSolarReturnAspect,
  formatSolarReturnNatalAspect,
  formatSolarReturnPeriod,
  getSolarReturnPointLabel,
  type SolarReturn,
  type SolarReturnPosition,
} from "@/lib/solar-returns";

type SolarReturnDetailsProps = {
  solarReturn: SolarReturn;
};

export function SolarReturnDetails({ solarReturn }: SolarReturnDetailsProps) {
  const ascendant = findPoint(solarReturn.positions, "ascendant");
  const midheaven = findPoint(solarReturn.positions, "midheaven");
  const bodies = SOLAR_RETURN_BODY_IDS.map((point) =>
    findPoint(solarReturn.positions, point),
  ).filter((position): position is SolarReturnPosition => position !== null);

  return (
    <div className="space-y-8">
      <DetailSubsection title="Período">
        <p className="text-sm text-foreground">
          {formatSolarReturnPeriod(solarReturn)}
        </p>
      </DetailSubsection>

      {solarReturn.professionalNotes ? (
        <DetailSubsection title="Notas profesionales">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {solarReturn.professionalNotes}
          </p>
        </DetailSubsection>
      ) : null}

      <DetailSubsection title="Ascendente">
        <p className="text-sm text-foreground">
          {formatAngle(ascendant)}
        </p>
        <p className="mt-2 text-sm text-foreground">
          Regente del Ascendente:{" "}
          {getAstrologicalBodyLabel(solarReturn.ascendantRuler)}
        </p>
      </DetailSubsection>

      <DetailSubsection title="Medio Cielo">
        <p className="text-sm text-foreground">{formatAngle(midheaven)}</p>
      </DetailSubsection>

      <DetailSubsection title="Planetas">
        {bodies.length === 0 ? (
          <EmptyNote>Sin posiciones cargadas.</EmptyNote>
        ) : (
          <ul>
            {bodies.map((position) => (
              <DetailRow key={position.point}>
                {formatBody(position)}
              </DetailRow>
            ))}
          </ul>
        )}
      </DetailSubsection>

      <DetailSubsection title="Aspectos de Revolución Solar">
        {solarReturn.aspects.length === 0 ? (
          <EmptyNote>Sin aspectos cargados.</EmptyNote>
        ) : (
          <ul>
            {solarReturn.aspects.map((aspect, index) => (
              <DetailRow
                key={`${aspect.pointA}-${aspect.aspect}-${aspect.pointB}-${index}`}
              >
                {formatSolarReturnAspect(aspect)}
              </DetailRow>
            ))}
          </ul>
        )}
      </DetailSubsection>

      <DetailSubsection title="Contactos con Carta Natal">
        {solarReturn.natalContacts.length === 0 ? (
          <EmptyNote>Sin contactos con Carta Natal.</EmptyNote>
        ) : (
          <ul>
            {solarReturn.natalContacts.map((contact, index) => (
              <DetailRow
                key={`${contact.solarReturnPoint}-${contact.aspect}-${contact.natalPoint}-${index}`}
              >
                {formatSolarReturnNatalAspect(contact)}
              </DetailRow>
            ))}
          </ul>
        )}
      </DetailSubsection>

      <DetailSubsection title="Síntesis de elementos">
        <ul className="grid max-w-md grid-cols-1 gap-x-6 gap-y-2 text-sm text-foreground sm:grid-cols-2">
          <li>Fuego: {solarReturn.elementSummary.fire}</li>
          <li>Tierra: {solarReturn.elementSummary.earth}</li>
          <li>Aire: {solarReturn.elementSummary.air}</li>
          <li>Agua: {solarReturn.elementSummary.water}</li>
        </ul>
      </DetailSubsection>
    </div>
  );
}

function findPoint(
  positions: SolarReturnPosition[],
  point: SolarReturnPosition["point"],
) {
  return positions.find((position) => position.point === point) ?? null;
}

function formatAngle(position: SolarReturnPosition | null) {
  if (!position) {
    return "Sin datos";
  }

  return `${getSolarReturnPointLabel(position.point)} · ${getSignLabel(position.sign)} · Casa natal ${position.natalOverlayHouse}`;
}

function formatBody(position: SolarReturnPosition) {
  const house = position.solarReturnHouse
    ? `Casa RS ${position.solarReturnHouse}`
    : "Sin casa RS";

  return `${getSolarReturnPointLabel(position.point)} · ${getSignLabel(position.sign)} · ${house} · Casa natal ${position.natalOverlayHouse}`;
}

function DetailSubsection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h3 className="text-xs font-medium tracking-wide text-muted uppercase">
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function EmptyNote({ children }: { children: string }) {
  return <p className="text-sm text-muted">{children}</p>;
}

function DetailRow({ children }: { children: string }) {
  return (
    <li className="border-b border-border/70 py-2.5 text-sm last:border-0">
      {children}
    </li>
  );
}
