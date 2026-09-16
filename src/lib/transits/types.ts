import type {
  AspectId,
  ChartPointId,
  HouseNumber,
  ZodiacSignId,
} from "@/lib/astrology";
import type { EclipseType, TransitPlanetId } from "./constants";

export type TransitPosition = {
  planet: TransitPlanetId;
  sign: ZodiacSignId;
  natalHouse: HouseNumber;
};

export type TransitAspect = {
  transitPlanet: TransitPlanetId;
  aspect: AspectId;
  natalPoint: ChartPointId;
};

export type TransitEclipse = {
  eclipseType: EclipseType;
  signA: ZodiacSignId;
  natalHouseA: HouseNumber;
  signB: ZodiacSignId;
  natalHouseB: HouseNumber;
};

export type TransitAnalysisInput = {
  analysisDate: string;
  positions: TransitPosition[];
  aspects: TransitAspect[];
  eclipses: TransitEclipse[];
};

export type TransitAnalysis = TransitAnalysisInput & {
  id: string;
  clientId: string;
  createdAt: string;
  updatedAt: string;
};

export type TransitAnalysisSummary = {
  id: string;
  clientId: string;
  analysisDate: string;
  createdAt: string;
  updatedAt: string;
  positionCount: number;
  aspectCount: number;
  eclipseCount: number;
};

export type TransitPositionFormData = {
  planet: TransitPlanetId | null;
  sign: ZodiacSignId | null;
  natalHouse: HouseNumber | null;
};

export type TransitAspectFormData = {
  transitPlanet: TransitPlanetId | null;
  aspect: AspectId | null;
  natalPoint: ChartPointId | null;
};

export type TransitEclipseFormData = {
  eclipseType: EclipseType | null;
  signA: ZodiacSignId | null;
  natalHouseA: HouseNumber | null;
  signB: ZodiacSignId | null;
  natalHouseB: HouseNumber | null;
};

export type TransitAnalysisFormData = {
  analysisDate: string;
  positions: TransitPositionFormData[];
  aspects: TransitAspectFormData[];
  eclipses: TransitEclipseFormData[];
};
