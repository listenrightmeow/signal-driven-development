export type GapCategory = 'SG' | 'HG' | 'LG' | 'DG';
export type Severity = 'error' | 'warning';
export type ResolutionAction = 'resolve';

export interface Resolution {
  action: ResolutionAction;
  summary: string;
  structuralImpact: string;
  hasModification?: boolean;
}

export interface Gap {
  id: string;
  category: GapCategory;
  severity: Severity;
  title: string;
  rule: string;
  element: string;
  analysis: string;
  recommendation: string;
  resolution: Resolution;
}

export interface Pass {
  number: number;
  gaps: Gap[];
}

export interface ConvergenceData {
  passTrajectory: number[];
  invariantGrowth: { start: number; end: number };
  sagaGrowth: { start: number; end: number };
  aggregateGrowth: { start: number; end: number };
  commandGrowth: { start: number; end: number };
  eventGrowth: { start: number; end: number };
}

export interface WalkthroughData {
  passes: Pass[];
  convergence: ConvergenceData;
}
