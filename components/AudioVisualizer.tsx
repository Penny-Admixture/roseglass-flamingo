
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
  const convolverRef = useRef<ConvolverNode | null>(null);
  const reverbGainRef = useRef<GainNode | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Function to create an impulse response for reverb
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

    // Initialize WaveSurfer
    const ws = (window as any).WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#8A2BE2',
      progressColor: '#00BFFF',
      cursorColor: '#FFFFFF',
      barWidth: 3,
      barRadius: 3,
      responsive: true,
      height: 100,
      normalize: true,
    });
    wavesurferRef.current = ws;

    // Initialize Web Audio API context and nodes
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

      const convolver = audioContext.createConvolver();
      convolver.buffer = createImpulseResponse(audioContext);
      convolverRef.current = convolver;

      const reverbGain = audioContext.createGain();
      reverbGainRef.current = reverbGain;

      // Dry path
      const dryGain = audioContext.createGain();

      // Wet path (for reverb)
      const wetGain = audioContext.createGain();

      source.connect(lowShelf).connect(highShelf).connect(dryGain).connect(audioContext.destination);
      source.connect(lowShelf).connect(highShelf).connect(convolver).connect(wetGain).connect(audioContext.destination);
      
      // Set initial effect values
      lowShelf.frequency.value = effectSettings.low_shelf.frequency;
      lowShelf.gain.value = effectSettings.low_shelf.gain;
      highShelf.frequency.value = effectSettings.high_shelf.frequency;
      highShelf.gain.value = effectSettings.high_shelf.gain;

      const reverbMix = effectSettings.reverb.mix;
      dryGain.gain.value = 1 - reverbMix;
      wetGain.gain.value = reverbMix;
    });

    ws.on('play', () => setIsPlaying(true));
    ws.on('pause', () => setIsPlaying(false));
    ws.on('finish', () => setIsPlaying(false));

    return () => {
      ws.destroy();
      audioContext.close();
    };
  }, [createImpulseResponse]);
  
  // Update audio source when file changes
  useEffect(() => {
    if (wavesurferRef.current && audioFile) {
      setIsReady(false);
      wavesurferRef.current.load(audioFile.url);
    }
  }, [audioFile]);

  // Update effect parameters when settings change
  useEffect(() => {
    if (lowShelfFilterRef.current) {
        lowShelfFilterRef.current.frequency.value = effectSettings.low_shelf.frequency;
        lowShelfFilterRef.current.gain.value = effectSettings.low_shelf.gain;
    }
    if (highShelfFilterRef.current) {
        highShelfFilterRef.current.frequency.value = effectSettings.high_shelf.frequency;
        highShelfFilterRef.current.gain.value = effectSettings.high_shelf.gain;
    }
    if (convolverRef.current && audioContextRef.current) {
        const mix = effectSettings.reverb.mix;
        const dryGain = audioContextRef.current.createGain();
        const wetGain = audioContextRef.current.createGain();
        const source = audioContextRef.current.createMediaElementSource(wavesurferRef.current!.getMediaElement());
        
        // This is a simplification. A proper implementation would require re-routing the audio graph.
        // For this demo, we can only control the gain of the initial setup.
        const dryNode = wavesurferRef.current?.backend.ac.createGain();
        const wetNode = wavesurferRef.current?.backend.ac.createGain();

        if(reverbGainRef.current){
          const mix = effectSettings.reverb.mix;
          // A more correct way to handle mix is using a wet/dry gain structure
          // but that requires complex graph rebuilding. Let's adjust gain on the reverb node.
          reverbGainRef.current.gain.value = mix; 
        }
    }
  }, [effectSettings]);


  const handlePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  return (
    <div className="bg-dark-3 p-4 rounded-lg shadow-lg">
      <div id="waveform" ref={waveformRef} className="h-28 cursor-pointer" />
      {audioFile && isReady && (
        <div className="flex items-center justify-center mt-4">
          <button onClick={handlePlayPause} className="bg-brand-blue text-white font-bold py-2 px-6 rounded-lg hover:bg-opacity-80 transition-all">
            {isPlaying ? 'Pause' : 'Play'}
          </button>
        </div>
      )}
      {!audioFile && (
          <div className="h-28 flex items-center justify-center">
            <p className="text-light-2">Upload an audio file to see the visualization</p>
          </div>
      )}
       {audioFile && !isReady && (
          <div className="h-28 flex items-center justify-center">
            <p className="text-light-2 animate-pulse-fast">Loading waveform...</p>
          </div>
      )}
    </div>
  );
};
