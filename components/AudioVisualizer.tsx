import React, { useEffect, useRef, useState, useCallback } from 'react';
import type WaveSurfer from 'wavesurfer.js';
import type { AudioFile, EffectSettings } from '../types';

interface AudioVisualizerProps {
  audioFile: AudioFile | null;
  effectSettings: EffectSettings;
  remixRequest: { pattern: number[], bpm: number } | null;
  onRemixComplete: () => void;
  setLoading: (loading: boolean) => void;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ audioFile, effectSettings, remixRequest, onRemixComplete, setLoading }) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lowShelfFilterRef = useRef<BiquadFilterNode | null>(null);
  const highShelfFilterRef = useRef<BiquadFilterNode | null>(null);
  const peakingFiltersRef = useRef<BiquadFilterNode[]>([]);
  const convolverRef = useRef<ConvolverNode | null>(null);
  const reverbGainRef = useRef<GainNode | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const isEqActive = effectSettings.parametric_eq_bands.some(band => band.enabled && band.gain !== 0);

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

  const sliceAndRemixBuffer = useCallback(async (
    audioBuffer: AudioBuffer,
    bpm: number,
    pattern: number[]
  ): Promise<AudioBuffer | null> => {
    if (!audioContextRef.current) return null;
    
    const sliceDuration = (60 / bpm) * 0.5; // 8th note duration
    const numSlices = Math.floor(audioBuffer.duration / sliceDuration);
    if (numSlices < 1) return audioBuffer;

    const { numberOfChannels, sampleRate } = audioBuffer;
    
    const slices: AudioBuffer[] = [];
    for (let i = 0; i < numSlices; i++) {
      const startOffset = i * sliceDuration;
      const frameCount = Math.floor(sliceDuration * sampleRate);
      if (startOffset + sliceDuration > audioBuffer.duration) continue;

      const sliceBuffer = audioContextRef.current.createBuffer(numberOfChannels, frameCount, sampleRate);
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const channelData = audioBuffer.getChannelData(channel);
        const sliceData = sliceBuffer.getChannelData(channel);
        sliceData.set(channelData.subarray(Math.floor(startOffset * sampleRate), Math.floor(startOffset * sampleRate) + frameCount));
      }
      slices.push(sliceBuffer);
    }

    if (slices.length === 0) return audioBuffer;

    const totalFrames = pattern.reduce((acc, index) => {
        if (index >= 0 && index < slices.length) {
            return acc + slices[index].length;
        }
        // for silence (-1)
        return acc + Math.floor(sliceDuration * sampleRate);
    }, 0);

    const newBuffer = audioContextRef.current.createBuffer(numberOfChannels, totalFrames, sampleRate);

    let currentFrame = 0;
    for (const sliceIndex of pattern) {
      if (sliceIndex >= 0 && sliceIndex < slices.length) {
        const slice = slices[sliceIndex];
        for (let channel = 0; channel < numberOfChannels; channel++) {
          newBuffer.getChannelData(channel).set(slice.getChannelData(channel), currentFrame);
        }
        currentFrame += slice.length;
      } else { // Handle silence
         currentFrame += Math.floor(sliceDuration * sampleRate);
      }
    }
    
    return newBuffer;
  }, []);

  useEffect(() => {
    if (!remixRequest || !wavesurferRef.current) return;
    
    const processRemix = async () => {
        setLoading(true);
        const originalBuffer = wavesurferRef.current?.getDecodedData();
        if (!originalBuffer) {
            onRemixComplete();
            return;
        }

        const newBuffer = await sliceAndRemixBuffer(originalBuffer, remixRequest.bpm, remixRequest.pattern);
        
        if (newBuffer && wavesurferRef.current) {
            // FIX: Property 'loadDecodedData' does not exist on type 'WaveSurfer'. This method is deprecated.
            // The modern approach is to use the `load` method with pre-decoded channel data and duration.
            const channels = Array.from({ length: newBuffer.numberOfChannels }, (_, i) => newBuffer.getChannelData(i));
            // The existing WaveSurfer types might be out of date. We cast to any to use the modern API.
            (wavesurferRef.current as any).load('', channels, newBuffer.duration);
        }
        onRemixComplete();
    };

    processRemix();
  }, [remixRequest, onRemixComplete, sliceAndRemixBuffer, setLoading]);

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

      peakingFiltersRef.current = [];
      let lastNode: AudioNode = highShelf;
      for (let i = 0; i < 10; i++) {
        const peaking = audioContext.createBiquadFilter();
        peaking.type = 'peaking';
        lastNode.connect(peaking);
        lastNode = peaking;
        peakingFiltersRef.current.push(peaking);
      }

      const convolver = audioContext.createConvolver();
      convolver.buffer = createImpulseResponse(audioContext);
      convolverRef.current = convolver;

      const reverbGain = audioContext.createGain();
      reverbGainRef.current = reverbGain;

      const dryGain = audioContext.createGain();
      const wetGain = audioContext.createGain();
      
      source.connect(lowShelf).connect(highShelf);
      
      lastNode.connect(dryGain).connect(audioContext.destination);
      lastNode.connect(convolver).connect(wetGain).connect(audioContext.destination);
      
      lowShelf.frequency.value = effectSettings.low_shelf.frequency;
      lowShelf.gain.value = effectSettings.low_shelf.gain;
      highShelf.frequency.value = effectSettings.high_shelf.frequency;
      highShelf.gain.value = effectSettings.high_shelf.gain;
      
      effectSettings.parametric_eq_bands.forEach((band, index) => {
          const filter = peakingFiltersRef.current[index];
          if (filter) {
              filter.frequency.value = band.frequency;
              filter.gain.value = band.enabled ? band.gain : 0;
              filter.Q.value = band.q;
          }
      });

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
    effectSettings.parametric_eq_bands.forEach((band, index) => {
        const filter = peakingFiltersRef.current[index];
        if (filter) {
            filter.frequency.value = band.frequency;
            filter.gain.value = band.enabled ? band.gain : 0;
            filter.Q.value = band.q;
        }
    });
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
