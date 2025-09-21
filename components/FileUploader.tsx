
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
        className={`bg-dark-3 p-4 rounded-lg shadow-lg border-2 border-dashed transition-all duration-300 ${isDragging ? 'border-brand-blue bg-dark-4' : 'border-dark-4'}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
    >
        <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileSelect}
            className="hidden"
        />
        <div className="flex flex-col items-center justify-center text-center p-6">
            <UploadIcon className="w-12 h-12 text-brand-blue mb-4" />
            <p className="text-light-2 mb-2">Drag & drop your audio file here</p>
            <p className="text-sm text-gray-500 mb-4">or</p>
            <button onClick={onButtonClick} className="bg-brand-blue text-white font-bold py-2 px-6 rounded-lg hover:bg-opacity-80 transition-all">
                Select File
            </button>
        </div>
    </div>
  );
};
