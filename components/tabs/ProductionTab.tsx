import React from 'react';
import type { AudioFile, EffectSettings } from '../../types';

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

interface ProductionTabProps {
    audioFile: AudioFile | null;
    effectSettings: EffectSettings;
    onSettingsChange: (effect: keyof EffectSettings, settings: any) => void;
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

    const handleParametricEqChange = (param: string, value: number) => {
        onSettingsChange('parametric_eq', { [param]: value });
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4 text-accent-periwinkle">Production Suite: <span className="text-white font-normal">{audioFile.file.name}</span></h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 <EffectControl label="Parametric EQ">
                    <SliderControl 
                        label="Frequency"
                        min={20}
                        max={20000}
                        step={10}
                        value={effectSettings.parametric_eq.frequency}
                        onChange={(e) => handleParametricEqChange('frequency', Number(e.target.value))}
                        unit="Hz"
                    />
                     <SliderControl 
                        label="Gain"
                        min={-24}
                        max={24}
                        step={0.1}
                        value={effectSettings.parametric_eq.gain}
                        onChange={(e) => handleParametricEqChange('gain', Number(e.target.value))}
                        unit="dB"
                    />
                     <SliderControl 
                        label="Q (Bandwidth)"
                        min={0.1}
                        max={10}
                        step={0.1}
                        value={effectSettings.parametric_eq.q}
                        onChange={(e) => handleParametricEqChange('q', Number(e.target.value))}
                    />
                </EffectControl>
                 <EffectControl label="Compressor">
                    <p className="text-sm text-text-muted">Controls for Threshold, Ratio, Attack, and Release would shape the audio's dynamics.</p>
                </EffectControl>
                 <EffectControl label="Reverb">
                    <p className="text-sm text-text-muted">Simulate acoustic spaces with controls for Size, Decay, and Wet/Dry mix.</p>
                </EffectControl>
                 <EffectControl label="Delay">
                    <p className="text-sm text-text-muted">Create echoes with Time, Feedback, and Mix controls, often syncable to tempo.</p>
                </EffectControl>
                 <EffectControl label="Stem Separation (AI)">
                    <p className="text-sm text-text-muted">An AI model like Spleeter or Demucs could isolate Vocals, Drums, Bass, etc.</p>
                </EffectControl>
                 <EffectControl label="AI Generation (AI)">
                    <p className="text-sm text-text-muted">Generate new musical parts or textures based on prompts, using models like Riffusion.</p>
                </EffectControl>
            </div>
        </div>
    );
};