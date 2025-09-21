import React from 'react';
import type { AudioFile, EffectSettings, ParametricEQBand, EQTarget, RemixerSettings } from '../../types';

interface SliderControlProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    unit?: string;
}

const SliderControl: React.FC<SliderControlProps> = ({ label, value, min, max, step, onChange, unit = '' }) => (
    <div className="space-y-2">
        <div className="flex justify-between items-center">
            <label className="text-sm text-text-main">{label}</label>
            <span className="text-xs bg-surface-1 px-2 py-1 rounded">{value.toFixed(2)} {unit}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={onChange}
            className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer"
        />
    </div>
);


const EffectControl: React.FC<{ label: string, children: React.ReactNode }> = ({ label, children }) => (
    <div className="bg-background p-4 rounded-lg border border-border">
        <label className="block text-md font-bold text-accent-purple mb-3 uppercase tracking-wider">{label}</label>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

interface EQBandControlProps {
    band: ParametricEQBand;
    onBandChange: (id: number, changes: Partial<ParametricEQBand>) => void;
}

const EQBandControl: React.FC<EQBandControlProps> = ({ band, onBandChange }) => {
    const targets: EQTarget[] = ['All', 'Transients', 'Sustained'];
    
    return (
        <div className={`p-4 rounded-lg border ${band.enabled ? 'border-border bg-surface-1' : 'border-transparent bg-surface-1/50'}`}>
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-accent-purple">Band {band.id}</h4>
                <div className="flex items-center">
                    <span className={`text-xs mr-2 ${band.enabled ? 'text-text-main' : 'text-text-muted'}`}>{band.enabled ? 'Enabled' : 'Disabled'}</span>
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={band.enabled} onChange={(e) => onBandChange(band.id, { enabled: e.target.checked })} className="sr-only peer" />
                        <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-periwinkle"></div>
                    </label>
                </div>
            </div>
            
            <div className={`space-y-4 transition-opacity ${band.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                 <SliderControl 
                    label="Frequency"
                    min={20}
                    max={20000}
                    step={10}
                    value={band.frequency}
                    onChange={(e) => onBandChange(band.id, { frequency: Number(e.target.value) })}
                    unit="Hz"
                />
                 <SliderControl 
                    label="Gain"
                    min={-24}
                    max={24}
                    step={0.1}
                    value={band.gain}
                    onChange={(e) => onBandChange(band.id, { gain: Number(e.target.value) })}
                    unit="dB"
                />
                 <SliderControl 
                    label="Q (Bandwidth)"
                    min={0.1}
                    max={18}
                    step={0.1}
                    value={band.q}
                    onChange={(e) => onBandChange(band.id, { q: Number(e.target.value) })}
                />
                <div>
                     <label className="text-sm text-text-main mb-2 block">Target</label>
                     <div className="flex gap-2">
                        {targets.map(t => (
                             <button 
                                key={t}
                                onClick={() => onBandChange(band.id, { target: t })}
                                className={`flex-1 text-xs py-1 px-2 rounded-md transition-colors ${band.target === t ? 'bg-accent-periwinkle text-background font-bold' : 'bg-surface-2 hover:bg-border'}`}
                            >
                                {t}
                            </button>
                        ))}
                     </div>
                </div>
            </div>
        </div>
    );
};

interface RemixerControlProps {
    settings: RemixerSettings;
    onSettingsChange: (changes: Partial<RemixerSettings>) => void;
    onRemix: (pattern: number[]) => void;
    onResetAudio: () => void;
}

const RemixerControl: React.FC<RemixerControlProps> = ({ settings, onSettingsChange, onRemix, onResetAudio }) => {
    const activePattern = settings.presets.find(p => p.name === settings.activePreset)?.pattern || [];

    return (
        <EffectControl label="Rhythmic Slice Remixer">
            <div className="flex items-center gap-4">
                <label className="text-sm text-text-main">BPM</label>
                <input
                    type="number"
                    value={settings.bpm}
                    onChange={(e) => onSettingsChange({ bpm: Number(e.target.value) })}
                    className="w-24 bg-surface-2 border border-border rounded p-1 text-center"
                />
            </div>
            <div>
                <label className="text-sm text-text-main mb-2 block">Preset Pattern</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {settings.presets.map(preset => (
                        <button
                            key={preset.name}
                            onClick={() => onSettingsChange({ activePreset: preset.name })}
                            className={`text-xs py-2 px-2 rounded-md transition-colors ${settings.activePreset === preset.name ? 'bg-accent-periwinkle text-background font-bold' : 'bg-surface-2 hover:bg-border'}`}
                        >
                            {preset.name}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex gap-4 pt-2">
                 <button 
                    onClick={() => onRemix(activePattern)}
                    className="flex-grow bg-accent-purple text-white font-bold py-2 px-4 rounded-md hover:opacity-80 transition-all"
                >
                    Apply Remix
                </button>
                <button 
                    onClick={onResetAudio}
                    className="flex-grow bg-surface-2 text-text-main font-bold py-2 px-4 rounded-md hover:bg-border transition-all"
                >
                    Reset to Original
                </button>
            </div>
        </EffectControl>
    );
};


interface ProductionTabProps {
    audioFile: AudioFile | null;
    effectSettings: EffectSettings;
    onSettingsChange: (effect: 'parametric_eq_bands' | 'remixer', settings: any) => void;
    onRemix: (pattern: number[]) => void;
    onResetAudio: () => void;
}

export const ProductionTab: React.FC<ProductionTabProps> = ({ audioFile, effectSettings, onSettingsChange, onRemix, onResetAudio }) => {

    if (!audioFile) {
        return (
            <div className="h-96 text-left">
                <h2 className="text-2xl font-bold mb-2 text-accent-periwinkle">Production Suite</h2>
                <p className="text-text-main">Upload an audio file to start applying effects.</p>
            </div>
        );
    }

    const handleBandChange = (id: number, changes: Partial<ParametricEQBand>) => {
        onSettingsChange('parametric_eq_bands', { id, changes });
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4 text-accent-periwinkle">Production Suite: <span className="text-white font-normal">{audioFile.file.name}</span></h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">
                    <EffectControl label="10-Band Parametric EQ">
                        <div className="max-h-[60vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 p-2 bg-background rounded">
                            {effectSettings.parametric_eq_bands.map(band => (
                                <EQBandControl key={band.id} band={band} onBandChange={handleBandChange} />
                            ))}
                        </div>
                    </EffectControl>
                </div>
                <div className="lg:col-span-1 space-y-4">
                     <RemixerControl 
                        settings={effectSettings.remixer}
                        onSettingsChange={(changes) => onSettingsChange('remixer', changes)}
                        onRemix={onRemix}
                        onResetAudio={onResetAudio}
                    />
                </div>
            </div>
        </div>
    );
};