import React, { useState, useCallback, useEffect } from 'react';
import { FileUploader } from './components/FileUploader';
import { GuideTab } from './components/tabs/GuideTab';
import { AnalysisTab } from './components/tabs/AnalysisTab';
import { ProductionTab } from './components/tabs/ProductionTab';
import { AudioVisualizer } from './components/AudioVisualizer';
import { LogoIcon } from './components/icons';
import type { AudioFile, EffectSettings, ParametricEQBand, RemixerPreset } from './types';
import { Tab } from './types';


const TabContent: React.FC<{ 
  activeTab: Tab; 
  audioFile: AudioFile | null; 
  isLoading: boolean; 
  setLoading: (loading: boolean) => void;
  effectSettings: EffectSettings;
  onEffectChange: (effect: keyof EffectSettings | 'parametric_eq_bands' | 'remixer', settings: any) => void;
  onRemix: (pattern: number[]) => void;
  onResetAudio: () => void;
}> = ({ activeTab, audioFile, isLoading, setLoading, effectSettings, onEffectChange, onRemix, onResetAudio }) => {
  switch (activeTab) {
    case Tab.GUIDE:
      return <GuideTab />;
    case Tab.ANALYSIS:
      return <AnalysisTab audioFile={audioFile} isLoading={isLoading} setLoading={setLoading} />;
    case Tab.PRODUCTION:
      return <ProductionTab 
                audioFile={audioFile} 
                effectSettings={effectSettings} 
                onSettingsChange={onEffectChange} 
                onRemix={onRemix}
                onResetAudio={onResetAudio}
             />;
    default:
      return <GuideTab />;
  }
};

const initialEQBands: ParametricEQBand[] = [
  { id: 1, enabled: true, frequency: 60, gain: 0, q: 1, target: 'All' },
  { id: 2, enabled: false, frequency: 150, gain: 0, q: 1, target: 'All' },
  { id: 3, enabled: false, frequency: 400, gain: 0, q: 1, target: 'All' },
  { id: 4, enabled: false, frequency: 1000, gain: 0, q: 1, target: 'All' },
  { id: 5, enabled: false, frequency: 2000, gain: 0, q: 1, target: 'All' },
  { id: 6, enabled: false, frequency: 4000, gain: 0, q: 1, target: 'All' },
  { id: 7, enabled: false, frequency: 6000, gain: 0, q: 1, target: 'All' },
  { id: 8, enabled: false, frequency: 8000, gain: 0, q: 1, target: 'All' },
  { id: 9, enabled: false, frequency: 10000, gain: 0, q: 1, target: 'All' },
  { id: 10, enabled: false, frequency: 15000, gain: 0, q: 1, target: 'All' },
];

const remixerPresets: RemixerPreset[] = [
    { name: 'Buildup', pattern: [0, 1, 2, 3, 4, 5, 6, 7, 4, 5, 6, 7, 6, 7, 6, 7] },
    { name: 'Stutter End', pattern: [0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 7, 7] },
    { name: 'Reverse Buildup', pattern: [7, 6, 5, 4, 3, 2, 1, 0] },
    { name: 'Kick Pattern', pattern: [0, -1, 2, -1, 4, -1, 6, -1] }, // -1 means silence
    { name: 'Forward & Back', pattern: [0, 1, 2, 3, 4, 5, 6, 7, 7, 6, 5, 4, 3, 2, 1, 0] },
    { name: 'Randomized', pattern: Array.from({length: 8}, () => Math.floor(Math.random() * 8)) },
];


export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.GUIDE);
  const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
  const [originalAudioUrl, setOriginalAudioUrl] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [remixRequest, setRemixRequest] = useState<{ pattern: number[], bpm: number } | null>(null);

  const [effectSettings, setEffectSettings] = useState<EffectSettings>({
    low_shelf: { frequency: 320, gain: 0 },
    high_shelf: { frequency: 3200, gain: 0 },
    reverb: { mix: 0 },
    parametric_eq_bands: initialEQBands,
    remixer: {
        bpm: 120,
        activePreset: 'Buildup',
        presets: remixerPresets,
    },
  });

  const handleFileChange = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setAudioFile({ file, url });
    setOriginalAudioUrl(url); // Save original URL for reset
    setActiveTab(Tab.PRODUCTION);
  }, []);

  const handleResetAudio = useCallback(() => {
    if (audioFile && originalAudioUrl) {
      setAudioFile({ ...audioFile, url: originalAudioUrl });
    }
  }, [audioFile, originalAudioUrl]);
  
  const handleEffectChange = useCallback((effectName: keyof EffectSettings | 'parametric_eq_bands' | 'remixer', settings: any) => {
    if (effectName === 'parametric_eq_bands') {
      setEffectSettings(prev => ({
        ...prev,
        parametric_eq_bands: prev.parametric_eq_bands.map(band =>
          band.id === settings.id ? { ...band, ...settings.changes } : band
        ),
      }));
    } else if (effectName === 'remixer') {
         setEffectSettings(prev => ({
            ...prev,
            remixer: { ...prev.remixer, ...settings },
        }));
    } else {
        setEffectSettings(prev => ({
            ...prev,
            [effectName]: { ...prev[effectName], ...settings },
        }));
    }
  }, []);

  const handleRemix = useCallback((pattern: number[]) => {
      setRemixRequest({ pattern, bpm: effectSettings.remixer.bpm });
  }, [effectSettings.remixer.bpm]);


  type TabButtonProps = {
    tab: Tab;
    children: React.ReactNode;
  };

  const TabButton = ({ tab, children }: TabButtonProps) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`w-full text-left px-4 py-2 text-sm rounded-md transition-all duration-200 ${
        activeTab === tab
          ? 'bg-surface-2 text-white font-bold'
          : 'text-text-main hover:bg-surface-2'
      }`}
    >
      {activeTab === tab && '> '}{children}
    </button>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <header className="bg-accent-blue p-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <LogoIcon className="h-8 w-8 text-white" />
          <h1 className="text-xl font-bold text-white tracking-wider">lattice category field</h1>
        </div>
        <div>
            <span className="text-sm bg-accent-magenta-dark text-white/90 px-3 py-1 rounded">
                v2025.09.21
            </span>
        </div>
      </header>

      <main className="flex-grow flex flex-col md:flex-row p-4 gap-4">
        <aside className="md:w-1/4 flex flex-col gap-4">
          <FileUploader onFileChange={handleFileChange} />
          <div className="bg-surface-1 p-4 rounded-lg border border-border flex-grow">
            <h2 className="text-lg font-bold mb-4 border-b border-border pb-2 text-accent-purple">Navigation</h2>
            <nav className="flex flex-col gap-3">
              <TabButton tab={Tab.GUIDE}>Guide.txt</TabButton>
              <TabButton tab={Tab.ANALYSIS}>AI_Analysis.exe</TabButton>
              <TabButton tab={Tab.PRODUCTION}>Production_Suite.dll</TabButton>
            </nav>
          </div>
        </aside>

        <div className="md:w-3/4 flex flex-col gap-4">
          <div className="bg-surface-1 border border-border p-4 rounded-lg animate-fade-in">
            <TabContent 
              activeTab={activeTab} 
              audioFile={audioFile} 
              isLoading={isLoading} 
              setLoading={setLoading} 
              effectSettings={effectSettings} 
              onEffectChange={handleEffectChange}
              onRemix={handleRemix}
              onResetAudio={handleResetAudio}
            />
          </div>
           <AudioVisualizer 
              audioFile={audioFile} 
              effectSettings={effectSettings} 
              remixRequest={remixRequest}
              onRemixComplete={() => {
                setRemixRequest(null);
                setLoading(false);
              }}
              setLoading={setLoading}
           />
        </div>
      </main>
    </div>
  );
}