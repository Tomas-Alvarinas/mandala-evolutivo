import type {
  AspectId,
  ChartPointId,
  HouseNumber,
  RulerPlanetId,
  ZodiacSignId,
} from "@/lib/astrology";
import type { SolarReturnBodyId, SolarReturnPointId } from "./constants";

export type SolarReturnPosition = {
  point: SolarReturnPointId;
  sign: ZodiacSignId;
  solarReturnHouse: HouseNumber | null;
  natalOverlayHouse: HouseNumber;
};

export type SolarReturnAspect = {
  pointA: SolarReturnPointId;
  aspect: AspectId;
  pointB: SolarReturnPointId;
};

export type SolarReturnNatalAspect = {
  solarReturnPoint: SolarReturnPointId;
  aspect: AspectId;
  natalPoint: ChartPointId;
};

export type SolarReturnElementSummary = {
  fire: number;
  earth: number;
  air: number;
  water: number;
};

export type SolarReturnInput = {
  periodStart: string;
  periodEnd: string;
  ascendantRuler: RulerPlanetId;
  professionalNotes: string | null;
  positions: SolarReturnPosition[];
  aspects: SolarReturnAspect[];
  natalContacts: SolarReturnNatalAspect[];
  elementSummary: SolarReturnElementSummary;
};

export type SolarReturn = SolarReturnInput & {
  id: string;
  clientId: string;
  createdAt: string;
  updatedAt: string;
};

export type SolarReturnSummary = {
  id: string;
  clientId: string;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
  updatedAt: string;
};

export type SolarReturnPositionFormData = {
  point: SolarReturnBodyId;
  sign: ZodiacSignId | null;
  solarReturnHouse: HouseNumber | null;
  natalOverlayHouse: HouseNumber | null;
};

export type SolarReturnAngleFormData = {
  sign: ZodiacSignId | null;
  natalOverlayHouse: HouseNumber | null;
};

export type SolarReturnAspectFormData = {
  pointA: SolarReturnPointId | null;
  aspect: AspectId | null;
  pointB: SolarReturnPointId | null;
};

export type SolarReturnNatalAspectFormData = {
  solarReturnPoint: SolarReturnPointId | null;
  aspect: AspectId | null;
  natalPoint: ChartPointId | null;
};

export type SolarReturnElementSummaryFormData = {
  fire: number;
  earth: number;
  air: number;
  water: number;
};

export type SolarReturnFormData = {
  periodStart: string;
  periodEnd: string;
  ascendantRuler: RulerPlanetId | null;
  professionalNotes: string;
  ascendant: SolarReturnAngleFormData;
  midheaven: SolarReturnAngleFormData;
  positions: SolarReturnPositionFormData[];
  aspects: SolarReturnAspectFormData[];
  natalContacts: SolarReturnNatalAspectFormData[];
  elementSummary: SolarReturnElementSummaryFormData;
};
