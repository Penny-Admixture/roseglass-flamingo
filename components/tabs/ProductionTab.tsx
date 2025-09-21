
import React from 'react';
import type { AudioFile } from '../../types';

const EffectControl: React.FC<{ label: string, children: React.ReactNode }> = ({ label, children }) => (
    <div className="bg-dark-4 p-4 rounded-lg">
        <label className="block text-sm font-medium text-brand-pink mb-2">{label}</label>
        {children}
    </div>
);

export const ProductionTab: React.FC<{ audioFile: AudioFile | null }> = ({ audioFile }) => {

    if (!audioFile) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-center">
                <h2 className="text-2xl font-bold mb-2">Production Suite</h2>
                <p className="text-light-2">Upload an audio file to start applying effects.</p>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4 text-brand-blue">Production Suite: <span className="text-white font-normal">{audioFile.file.name}</span></h2>
            <p className="mb-6 text-light-2">
                This is a concept for an effects rack. In a full application, these controls would manipulate real-time DSP effects. For now, it demonstrates the UI/UX for such a tool. The real-time effects are not implemented in this version.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 <EffectControl label="Parametric EQ">
                    <p className="text-sm text-light-2">A full EQ would have multiple bands with frequency, gain, and Q controls.</p>
                </EffectControl>
                 <EffectControl label="Compressor">
                    <p className="text-sm text-light-2">Controls for Threshold, Ratio, Attack, and Release would shape the audio's dynamics.</p>
                </EffectControl>
                 <EffectControl label="Reverb">
                    <p className="text-sm text-light-2">Simulate acoustic spaces with controls for Size, Decay, and Wet/Dry mix.</p>
                </EffectControl>
                 <EffectControl label="Delay">
                    <p className="text-sm text-light-2">Create echoes with Time, Feedback, and Mix controls, often syncable to tempo.</p>
                </EffectControl>
                 <EffectControl label="Stem Separation (AI)">
                    <p className="text-sm text-light-2">An AI model like Spleeter or Demucs could isolate Vocals, Drums, Bass, etc.</p>
                </EffectControl>
                 <EffectControl label="AI Generation (AI)">
                    <p className="text-sm text-light-2">Generate new musical parts or textures based on prompts, using models like Riffusion.</p>
                </EffectControl>
            </div>
        </div>
    );
};
