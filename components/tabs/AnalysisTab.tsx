
import React, { useState, useCallback } from 'react';
import { analyzeAudioWithGemini } from '../../services/geminiService';
import type { AudioFile, AnalysisResult } from '../../types';
import { LoadingSpinner } from '../icons';

const AnalysisCard: React.FC<{ result: AnalysisResult }> = ({ result }) => (
    <div className="bg-dark-4 p-4 rounded-lg animate-fade-in">
        <h3 className="text-xl font-semibold text-brand-blue mb-2">{result.title}</h3>
        <p className="text-sm text-light-2 mb-4">{result.description}</p>
        <div className="space-y-2">
            {result.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center bg-dark-2 p-2 rounded">
                    <span className="font-medium text-light-1">{item.label}</span>
                    <span className="text-light-2 text-right">{item.value}</span>
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
            <div className="flex flex-col items-center justify-center h-96 text-center">
                <h2 className="text-2xl font-bold mb-2">AI Analysis Engine</h2>
                <p className="text-light-2">Please upload an audio file to begin analysis.</p>
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
            <h2 className="text-2xl font-bold mb-4 text-brand-blue">AI Analysis: <span className="text-white font-normal">{audioFile.file.name}</span></h2>
            <div className="flex flex-wrap gap-4 mb-6 p-4 bg-dark-4 rounded-lg">
                {analysisTypes.map(type => (
                    <button
                        key={type}
                        onClick={() => handleAnalysis(type)}
                        disabled={isLoading}
                        className="flex-1 bg-brand-purple text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-all disabled:bg-dark-4 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <LoadingSpinner /> : `Get ${type}`}
                    </button>
                ))}
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {isLoading && !analysisResults.length && (
                    <div className="text-center p-8">
                        <LoadingSpinner className="mx-auto h-8 w-8" />
                        <p className="mt-2 text-light-2 animate-pulse-fast">AI is analyzing your audio...</p>
                    </div>
                )}
                {analysisResults.map((result, index) => (
                    <AnalysisCard key={index} result={result} />
                ))}
            </div>
        </div>
    );
};
