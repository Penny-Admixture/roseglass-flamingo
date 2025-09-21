import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon } from './icons';

interface FileUploaderProps {
  onFileChange: (file: File) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File | null) => {
    if (file && (file.type.startsWith('audio/') || file.name.endsWith('.mp3') || file.name.endsWith('.wav'))) {
      onFileChange(file);
    } else {
      alert('Please upload a valid audio file (e.g., MP3, WAV).');
    }
  }, [onFileChange]);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  }

  return (
    <div 
        className={`bg-surface-1 p-4 rounded-lg border-2 border-dashed transition-all duration-300 ${isDragging ? 'border-accent-periwinkle' : 'border-border'}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
    >
        <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,.mp3,.wav"
            onChange={handleFileSelect}
            className="hidden"
        />
        <div className="flex items-start p-4">
            <UploadIcon className="w-10 h-10 text-accent-periwinkle mr-4 flex-shrink-0" />
            <div className='text-left'>
                <p className="text-text-main mb-2 font-bold">Drop audio file or select</p>
                <p className="text-sm text-text-muted mb-4">Drag & drop your .wav or .mp3 file here.</p>
                <button onClick={onButtonClick} className="bg-accent-periwinkle text-background font-bold py-2 px-4 rounded-md hover:opacity-80 transition-all text-sm">
                    Select File
                </button>
            </div>
        </div>
    </div>
  );
};