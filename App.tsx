import React, { useState, useCallback } from 'react';
import { FileUploader } from './components/FileUploader';
import { GuideTab } from './components/tabs/GuideTab';
import { AnalysisTab } from './components/tabs/AnalysisTab';
import { ProductionTab } from './components/tabs/ProductionTab';
import { AudioVisualizer } from './components/AudioVisualizer';
import { LogoIcon } from './components/icons';
import type { AudioFile, EffectSettings, ParametricEQBand } from './types';
import { Tab } from './types';


const TabContent: React.FC<{ 
  activeTab: Tab; 
  audioFile: AudioFile | null; 
  isLoading: boolean; 
  setLoading: (loading: boolean) => void;
  effectSettings: EffectSettings;
  onEffectChange: (effect: keyof EffectSettings | 'parametric_eq_bands', settings: any) => void;
}> = ({ activeTab, audioFile, isLoading, setLoading, effectSettings, onEffectChange }) => {
  switch (activeTab) {
    case Tab.GUIDE:
      return <GuideTab />;
    case Tab.ANALYSIS:
      return <AnalysisTab audioFile={audioFile} isLoading={isLoading} setLoading={setLoading} />;
    case Tab.PRODUCTION:
      return <ProductionTab audioFile={audioFile} effectSettings={effectSettings} onSettingsChange={onEffectChange} />;
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

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.GUIDE);
  const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [effectSettings, setEffectSettings] = useState<EffectSettings>({
    low_shelf: { frequency: 320, gain: 0 },
    high_shelf: { frequency: 3200, gain: 0 },
    reverb: { mix: 0 },
    parametric_eq_bands: initialEQBands,
  });

  const handleFileChange = useCallback((file: File) => {
    setAudioFile({
      file,
      url: URL.createObjectURL(file),
    });
    setActiveTab(Tab.PRODUCTION);
  }, []);
  
  const handleEffectChange = useCallback((effectName: keyof EffectSettings | 'parametric_eq_bands', settings: any) => {
    if (effectName === 'parametric_eq_bands') {
      setEffectSettings(prev => ({
        ...prev,
        parametric_eq_bands: prev.parametric_eq_bands.map(band =>
          band.id === settings.id ? { ...band, ...settings.changes } : band
        ),
      }));
    } else {
        setEffectSettings(prev => ({
            ...prev,
            [effectName]: { ...prev[effectName], ...settings },
        }));
    }
  }, []);


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
            <TabContent activeTab={activeTab} audioFile={audioFile} isLoading={isLoading} setLoading={setLoading} effectSettings={effectSettings} onEffectChange={handleEffectChange} />
          </div>
           <AudioVisualizer audioFile={audioFile} effectSettings={effectSettings} />
        </div>
      </main>
    </div>
  );
}