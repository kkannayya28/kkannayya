/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  BookOpen, 
  Zap, 
  MessageSquare, 
  Search, 
  Plus, 
  Ghost,
  Sparkles,
  ArrowRight,
  BrainCircuit,
  History
} from 'lucide-react';
import Navbar from './components/Navbar';
import NotesUpload from './components/NotesUpload';
import StudySheet from './components/StudySheet';
import Flashcards from './components/Flashcards';
import Chat from './components/Chat';
import ClueNoteGame from './components/ClueNoteGame';
import MemoryBloom from './components/MemoryBloom';

export type StudyData = {
  summary: string;
  funFact: string;
  flashcards: Array<{ question: string; answer: string }>;
  mindMap: {
    nodes: Array<{ id: string; label: string; explanation?: string }>;
    edges: Array<{ from: string; to: string }>;
  };
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'upload' | 'sheet' | 'flashcards' | 'chat' | 'game' | 'bloom'>('upload');
  const [notes, setNotes] = useState<string>('');
  const [studyData, setStudyData] = useState<StudyData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleProcessNotes = async (uploadedNotes: string) => {
    setNotes(uploadedNotes);
    setIsLoading(true);
    try {
      const response = await fetch('/api/study-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: uploadedNotes }),
      });
      const data = await response.json();
      setStudyData(data);
      setActiveTab('sheet');
    } catch (error) {
      console.error('Processing failed', error);
      alert('Failed to process notes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} hasData={!!studyData} />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'upload' && (
              <NotesUpload onUpload={handleProcessNotes} isLoading={isLoading} />
            )}
            
            {activeTab === 'sheet' && studyData && (
              <StudySheet data={studyData} />
            )}

            {activeTab === 'flashcards' && studyData && (
              <Flashcards flashcards={studyData.flashcards} />
            )}

            {activeTab === 'chat' && (
              <Chat notes={notes} />
            )}

            {activeTab === 'game' && (
              <ClueNoteGame notes={notes} />
            )}

            {activeTab === 'bloom' && (
              <MemoryBloom notes={notes} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="p-8 border-t-4 border-neo-black bg-neo-yellow text-center font-bold">
        MEMORA © 2026 - TURN NOTES INTO KNOWLEDGE
      </footer>
    </div>
  );
}

