import React, { useEffect, useRef, useState, useCallback } from 'react';
import type WaveSurfer from 'wavesurfer.js';
import type { AudioFile, EffectSettings } from '../types';

interface AudioVisualizerProps {
  audioFile: AudioFile | null;
  effectSettings: EffectSettings;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ audioFile, effectSettings }) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lowShelfFilterRef = useRef<BiquadFilterNode | null>(null);
  const highShelfFilterRef = useRef<BiquadFilterNode | null>(null);
  const peakingFilterRef = useRef<BiquadFilterNode | null>(null);
  const convolverRef = useRef<ConvolverNode | null>(null);
  const reverbGainRef = useRef<GainNode | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const isEqActive = effectSettings.parametric_eq.gain !== 0;

  const createImpulseResponse = useCallback((audioContext: AudioContext) => {
    const duration = 2;
    const decay = 1.5;
    const sampleRate = audioContext.sampleRate;
    const length = sampleRate * duration;
    const impulse = audioContext.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);
    for (let i = 0; i < length; i++) {
        left[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
        right[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
    return impulse;
  }, []);

  useEffect(() => {
    if (!waveformRef.current) return;

    const ws = (window as any).WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#a6a6ff',
      progressColor: '#c774e8',
      cursorColor: '#FFFFFF',
      barWidth: 3,
      barRadius: 3,
      responsive: true,
      height: 100,
      normalize: true,
    });
    wavesurferRef.current = ws;

    const audioContext = new AudioContext();
    audioContextRef.current = audioContext;

    ws.on('ready', () => {
      setIsReady(true);
      const mediaElement = ws.getMediaElement();
      const source = audioContext.createMediaElementSource(mediaElement);
      
      const lowShelf = audioContext.createBiquadFilter();
      lowShelf.type = 'lowshelf';
      lowShelfFilterRef.current = lowShelf;

      const highShelf = audioContext.createBiquadFilter();
      highShelf.type = 'highshelf';
      highShelfFilterRef.current = highShelf;

      const peaking = audioContext.createBiquadFilter();
      peaking.type = 'peaking';
      peakingFilterRef.current = peaking;

      const convolver = audioContext.createConvolver();
      convolver.buffer = createImpulseResponse(audioContext);
      convolverRef.current = convolver;

      const reverbGain = audioContext.createGain();
      reverbGainRef.current = reverbGain;

      const dryGain = audioContext.createGain();
      const wetGain = audioContext.createGain();

      source.connect(lowShelf).connect(highShelf).connect(peaking).connect(dryGain).connect(audioContext.destination);
      source.connect(lowShelf).connect(highShelf).connect(peaking).connect(convolver).connect(wetGain).connect(audioContext.destination);
      
      lowShelf.frequency.value = effectSettings.low_shelf.frequency;
      lowShelf.gain.value = effectSettings.low_shelf.gain;
      highShelf.frequency.value = effectSettings.high_shelf.frequency;
      highShelf.gain.value = effectSettings.high_shelf.gain;
      peaking.frequency.value = effectSettings.parametric_eq.frequency;
      peaking.gain.value = effectSettings.parametric_eq.gain;
      peaking.Q.value = effectSettings.parametric_eq.q;

      const reverbMix = effectSettings.reverb.mix;
      dryGain.gain.value = 1 - reverbMix;
      wetGain.gain.value = reverbMix;
    });

    ws.on('play', () => setIsPlaying(true));
    ws.on('pause', () => setIsPlaying(false));
    ws.on('finish', () => setIsPlaying(false));

    return () => {
      ws.destroy();
      audioContext.close().catch(console.error);
    };
  }, [createImpulseResponse]);
  
  useEffect(() => {
    if (wavesurferRef.current && audioFile) {
      setIsReady(false);
      wavesurferRef.current.load(audioFile.url);
    }
  }, [audioFile]);

  useEffect(() => {
    if (lowShelfFilterRef.current) {
        lowShelfFilterRef.current.frequency.value = effectSettings.low_shelf.frequency;
        lowShelfFilterRef.current.gain.value = effectSettings.low_shelf.gain;
    }
    if (highShelfFilterRef.current) {
        highShelfFilterRef.current.frequency.value = effectSettings.high_shelf.frequency;
        highShelfFilterRef.current.gain.value = effectSettings.high_shelf.gain;
    }
    if(peakingFilterRef.current) {
        peakingFilterRef.current.frequency.value = effectSettings.parametric_eq.frequency;
        peakingFilterRef.current.gain.value = effectSettings.parametric_eq.gain;
        peakingFilterRef.current.Q.value = effectSettings.parametric_eq.q;
    }
    if (reverbGainRef.current){
        reverbGainRef.current.gain.value = effectSettings.reverb.mix;
    }
  }, [effectSettings]);


  const handlePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  return (
    <div className={`bg-surface-1 border border-border p-4 rounded-lg shadow-lg transition-shadow duration-300 ${isEqActive ? 'eq-active-glow' : ''}`}>
      <div id="waveform" ref={waveformRef} className="h-28 cursor-pointer" />
      {audioFile && isReady && (
        <div className="flex items-start mt-4">
          <button onClick={handlePlayPause} className="bg-accent-periwinkle text-background font-bold py-2 px-6 rounded-md hover:opacity-80 transition-all">
            {isPlaying ? 'Pause' : 'Play'}
          </button>
        </div>
      )}
      {!audioFile && (
          <div className="h-28 flex items-center justify-start">
            <p className="text-text-muted">Upload an audio file to see the visualization.</p>
          </div>
      )}
       {audioFile && !isReady && (
          <div className="h-28 flex items-center justify-start">
            <p className="text-text-muted animate-pulse-fast">Loading waveform...</p>
          </div>
      )}
    </div>
  );
};