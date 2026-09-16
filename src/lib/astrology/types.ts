import type {
  AspectId,
  AstrologicalBodyId,
  ChartPointId,
  ConfigurationId,
  HouseNumber,
  RulerPlanetId,
  ZodiacSignId,
} from "./constants";

export interface AstrologicalPosition {
  point: AstrologicalBodyId;
  sign: ZodiacSignId;
  house: HouseNumber;
}

export interface ChartAngles {
  ascendant: ZodiacSignId;
  midheaven: ZodiacSignId;
}

export interface NatalAspect {
  pointA: ChartPointId;
  aspect: AspectId;
  pointB: ChartPointId;
}

export interface ChartConfiguration {
  type: ConfigurationId;
  points: ChartPointId[];
}

export interface ChartConfigurationFormData {
  type: ConfigurationId;
  points: Array<ChartPointId | null>;
}

export interface HouseRuler {
  house: HouseNumber;
  planet: RulerPlanetId;
  sign: ZodiacSignId;
}

export interface HouseRulerFormData {
  house: HouseNumber | null;
  planet: RulerPlanetId | null;
  sign: ZodiacSignId | null;
}

export interface NatalChart extends ChartAngles {
  positions: AstrologicalPosition[];
  aspects: NatalAspect[];
  configurations: ChartConfiguration[];
  houseRulers: HouseRuler[];
}

export interface AstrologicalPositionFormData {
  point: AstrologicalBodyId;
  sign: ZodiacSignId | null;
  house: HouseNumber | null;
}

export interface ChartAnglesFormData {
  ascendant: ZodiacSignId | null;
  midheaven: ZodiacSignId | null;
}

export interface NatalAspectFormData {
  pointA: ChartPointId | null;
  aspect: AspectId | null;
  pointB: ChartPointId | null;
}

export interface NatalChartFormData extends ChartAnglesFormData {
  positions: AstrologicalPositionFormData[];
  aspects: NatalAspectFormData[];
  configurations: ChartConfigurationFormData[];
  houseRulers: HouseRulerFormData[];
}
