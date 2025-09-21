
import React, { useState, useCallback } from 'react';
import { FileUploader } from './components/FileUploader';
import { GuideTab } from './components/tabs/GuideTab';
import { AnalysisTab } from './components/tabs/AnalysisTab';
import { ProductionTab } from './components/tabs/ProductionTab';
import { AudioVisualizer } from './components/AudioVisualizer';
import { LogoIcon, GithubIcon } from './components/icons';
import type { AudioFile, EffectSettings } from './types';
import { Tab } from './types';


const TabContent: React.FC<{ activeTab: Tab; audioFile: AudioFile | null; isLoading: boolean; setLoading: (loading: boolean) => void }> = ({ activeTab, audioFile, isLoading, setLoading }) => {
  switch (activeTab) {
    case Tab.GUIDE:
      return <GuideTab />;
    case Tab.ANALYSIS:
      return <AnalysisTab audioFile={audioFile} isLoading={isLoading} setLoading={setLoading} />;
    case Tab.PRODUCTION:
      return <ProductionTab audioFile={audioFile} />;
    default:
      return <GuideTab />;
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.GUIDE);
  const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [effectSettings, setEffectSettings] = useState<EffectSettings>({
    low_shelf: { frequency: 320, gain: 0 },
    high_shelf: { frequency: 3200, gain: 0 },
    reverb: { mix: 0 }
  });

  const handleFileChange = useCallback((file: File) => {
    setAudioFile({
      file,
      url: URL.createObjectURL(file),
    });
    setActiveTab(Tab.ANALYSIS);
  }, []);

  // Fix: Explicitly define a type for TabButton props to resolve a potential TypeScript inference issue where the 'children' prop was incorrectly flagged as missing.
  type TabButtonProps = {
    tab: Tab;
    children: React.ReactNode;
  };

  const TabButton = ({ tab, children }: TabButtonProps) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
        activeTab === tab
          ? 'bg-brand-blue text-white shadow-lg'
          : 'bg-dark-3 text-light-2 hover:bg-dark-4 hover:text-white'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-dark-2 flex flex-col font-sans">
      <header className="bg-dark-3 p-4 border-b border-dark-4 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-3">
          <LogoIcon className="h-8 w-8 text-brand-blue" />
          <h1 className="text-xl font-bold text-white tracking-wider">Audio Flamingo Web Studio</h1>
        </div>
        <a href="https://github.com/NVIDIA/audio-flamingo" target="_blank" rel="noopener noreferrer" className="text-light-2 hover:text-brand-blue transition-colors">
            <GithubIcon className="h-6 w-6" />
        </a>
      </header>

      <main className="flex-grow flex flex-col md:flex-row p-4 gap-4">
        <aside className="md:w-1/4 flex flex-col gap-4">
          <FileUploader onFileChange={handleFileChange} />
          <div className="bg-dark-3 p-4 rounded-lg shadow-lg flex-grow">
            <h2 className="text-lg font-semibold mb-4 border-b border-dark-4 pb-2">Navigation</h2>
            <nav className="flex flex-col gap-3">
              <TabButton tab={Tab.GUIDE}>Guide</TabButton>
              <TabButton tab={Tab.ANALYSIS}>AI Analysis</TabButton>
              <TabButton tab={Tab.PRODUCTION}>Production Suite</TabButton>
            </nav>
          </div>
        </aside>

        <div className="md:w-3/4 flex flex-col gap-4">
          <div className="bg-dark-3 p-4 rounded-lg shadow-lg animate-fade-in">
            <TabContent activeTab={activeTab} audioFile={audioFile} isLoading={isLoading} setLoading={setLoading}/>
          </div>
           <AudioVisualizer audioFile={audioFile} effectSettings={effectSettings} />
        </div>
      </main>
    </div>
  );
}
