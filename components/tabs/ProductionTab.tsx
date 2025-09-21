import React from 'react';
import type { AudioFile, EffectSettings, ParametricEQBand, EQTarget } from '../../types';

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


interface ProductionTabProps {
    audioFile: AudioFile | null;
    effectSettings: EffectSettings;
    onSettingsChange: (effect: 'parametric_eq_bands', settings: { id: number; changes: Partial<ParametricEQBand> }) => void;
}

export const ProductionTab: React.FC<ProductionTabProps> = ({ audioFile, effectSettings, onSettingsChange }) => {

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
            
            <div className="space-y-4">
                <EffectControl label="10-Band Parametric EQ">
                    <div className="max-h-[60vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-2 bg-background rounded">
                        {effectSettings.parametric_eq_bands.map(band => (
                            <EQBandControl key={band.id} band={band} onBandChange={handleBandChange} />
                        ))}
                    </div>
                </EffectControl>
            </div>
        </div>
    );
};