import React, { useState, useCallback } from 'react';
import { analyzeAudioWithGemini } from '../../services/geminiService';
import type { AudioFile, AnalysisResult } from '../../types';
import { LoadingSpinner } from '../icons';

const AnalysisCard: React.FC<{ result: AnalysisResult }> = ({ result }) => (
    <div className="bg-background p-4 rounded-lg animate-fade-in border border-border">
        <h3 className="text-xl font-bold text-accent-purple mb-2">{result.title}</h3>
        <p className="text-sm text-text-main mb-4">{result.description}</p>
        <div className="space-y-2">
            {result.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center bg-surface-1/50 p-2 rounded">
                    <span className="font-medium text-text-main">{item.label}:</span>
                    <span className="text-text-main text-right">{item.value}</span>
                </div>
            ))}
        </div>
    </div>
);

export const AnalysisTab: React.FC<{ audioFile: AudioFile | null, isLoading: boolean, setLoading: (loading: boolean) => void }> = ({ audioFile, isLoading, setLoading }) => {
    const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);

    const handleAnalysis = useCallback(async (type: 'Key Characteristics' | 'Musical Analysis' | 'Production Suggestions') => {
        if (!audioFile) return;
        setLoading(true);
        try {
            const result = await analyzeAudioWithGemini(audioFile.file.name, type);
            setAnalysisResults(prev => [result, ...prev]);
        } catch (error) {
            console.error(error);
            alert('Failed to get analysis.');
        } finally {
            setLoading(false);
        }
    }, [audioFile, setLoading]);

    if (!audioFile) {
        return (
            <div className="h-96 text-left">
                <h2 className="text-2xl font-bold mb-2 text-accent-periwinkle">AI Analysis Engine</h2>
                <p className="text-text-main">Please upload an audio file to begin analysis.</p>
            </div>
        );
    }
    
    const analysisTypes: ('Key Characteristics' | 'Musical Analysis' | 'Production Suggestions')[] = [
        'Key Characteristics',
        'Musical Analysis',
        'Production Suggestions'
    ];

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4 text-accent-periwinkle">AI Analysis: <span className="text-white font-normal">{audioFile.file.name}</span></h2>
            <div className="flex flex-wrap gap-4 mb-6 p-4 bg-background rounded-lg border border-border">
                {analysisTypes.map(type => (
                    <button
                        key={type}
                        onClick={() => handleAnalysis(type)}
                        disabled={isLoading}
                        className="flex-1 bg-accent-periwinkle text-background font-bold py-2 px-4 rounded-md hover:opacity-80 transition-all disabled:bg-border disabled:text-text-muted disabled:cursor-not-allowed"
                    >
                        {isLoading ? <LoadingSpinner /> : `Get ${type}`}
                    </button>
                ))}
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {isLoading && !analysisResults.length && (
                    <div className="text-left p-8">
                        <LoadingSpinner className="h-8 w-8 text-accent-periwinkle" />
                        <p className="mt-2 text-text-main animate-pulse-fast">AI is analyzing your audio...</p>
                    </div>
                )}
                {analysisResults.map((result, index) => (
                    <AnalysisCard key={index} result={result} />
                ))}
            </div>
        </div>
    );
};