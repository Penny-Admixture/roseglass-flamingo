
import React from 'react';

const Step: React.FC<{ number: number, title: string, description: string }> = ({ number, title, description }) => (
    <div className="flex items-start gap-4 p-4 bg-dark-4 rounded-lg">
        <div className="flex-shrink-0 w-10 h-10 bg-brand-blue rounded-full flex items-center justify-center font-bold text-white text-lg">
            {number}
        </div>
        <div>
            <h3 className="font-semibold text-lg text-white">{title}</h3>
            <p className="text-light-2">{description}</p>
        </div>
    </div>
);


export const GuideTab: React.FC = () => {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-4 text-brand-blue">Welcome to the Studio!</h2>
            <p className="mb-6 text-light-2">
                This web application is a demonstration of what a modern, AI-powered audio suite could look like. Follow these steps to explore its features.
            </p>
            <div className="space-y-4">
                <Step 
                    number={1}
                    title="Upload Your Audio"
                    description="Use the uploader on the left to select an audio file from your computer. WAV and MP3 formats are recommended. This will load the audio into the visualizer."
                />
                <Step 
                    number={2}
                    title="Get AI-Powered Analysis"
                    description="Navigate to the 'AI Analysis' tab. Here, you can request different types of analysis from a simulated AI model, which will break down your track's characteristics."
                />
                 <Step 
                    number={3}
                    title="Experiment in the Production Suite"
                    description="Go to the 'Production Suite' tab to apply real-time audio effects. Adjust the parameters and hear how they affect your sound. This uses your browser's Web Audio API."
                />
                 <Step 
                    number={4}
                    title="Explore & Imagine"
                    description="This entire interface is a prototype built in React and TypeScript. Imagine the possibilities of integrating real, powerful AI models like Audio Flamingo for generation, separation, and advanced analysis."
                />
            </div>
        </div>
    );
}
