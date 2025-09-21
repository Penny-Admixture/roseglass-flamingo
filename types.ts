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
  parametric_eq: {
    frequency: number;
    gain: number;
    q: number;
  };
}