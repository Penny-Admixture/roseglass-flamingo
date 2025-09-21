export interface AudioFile {
  file: File;
  url: string;
}

export interface AnalysisResult {
  title: string;
  description: string;
  items: { label: string; value: string }[];
}

export enum Tab {
  GUIDE,
  ANALYSIS,
  PRODUCTION,
}

export type EQTarget = 'All' | 'Transients' | 'Sustained';

export interface ParametricEQBand {
  id: number;
  enabled: boolean;
  frequency: number;
  gain: number;
  q: number;
  target: EQTarget;
}

export interface EffectSettings {
  low_shelf: {
    frequency: number;
    gain: number;
  };
  high_shelf: {
    frequency: number;
    gain: number;
  };
  reverb: {
    mix: number;
  };
  parametric_eq_bands: ParametricEQBand[];
}