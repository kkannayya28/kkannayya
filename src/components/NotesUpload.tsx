import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, FileText, X, Loader2, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

interface NotesUploadProps {
  onUpload: (notes: string) => void;
  isLoading: boolean;
}

export default function NotesUpload({ onUpload, isLoading }: NotesUploadProps) {
  const [inputText, setInputText] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onabort = () => console.log('file reading was aborted');
      reader.onerror = () => console.log('file reading has failed');
      reader.onload = () => {
        const str = reader.result as string;
        onUpload(str);
      };
      reader.readAsText(file);
    });
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'], // Note: text extraction from PDF would need a lib, usually we'd handle on backend
    },
    disabled: isLoading
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center space-y-4">
        <motion.h1 
          className="text-6xl font-display font-extrabold uppercase tracking-tighter"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          Level Up Your <span className="bg-neo-blue text-white px-2">Study</span> Game
        </motion.h1>
        <p className="text-xl font-medium text-gray-600 max-w-2xl mx-auto">
          Drop your lecture notes, PDFs, or raw text and let Memora's AI transform them into aesthetic study sheets.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div 
          {...getRootProps()} 
          className={cn(
            "neo-card p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-colors min-h-[300px]",
            isDragActive ? "bg-neo-green/20" : "bg-white",
            isLoading && "opacity-50 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />
          <div className="bg-neo-blue border-2 border-neo-black p-4 mb-4 shadow-[4px_4px_0px_#1A1A1B]">
            {isLoading ? (
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            ) : (
              <Upload className="w-12 h-12 text-white" />
            )}
          </div>
          <h3 className="text-2xl font-bold uppercase mb-2">
            {isLoading ? "Analyzing..." : "Drag & Drop Notes"}
          </h3>
          <p className="font-medium text-gray-500">Supports .txt files</p>
        </div>

        <div className="neo-card p-8 bg-neo-yellow">
          <h3 className="text-2xl font-bold uppercase mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            Or Paste Text
          </h3>
          <textarea
            className="w-full h-[200px] neo-input mb-4 resize-none"
            placeholder="Paste your lecture notes here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
          />
          <button
            onClick={() => onUpload(inputText)}
            disabled={!inputText.trim() || isLoading}
            className="w-full neo-button bg-neo-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            Generate Study Sheet
          </button>
        </div>
      </div>
    </div>
  );
}
