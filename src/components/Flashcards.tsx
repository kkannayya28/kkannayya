import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, RotateCcw, BrainCircuit, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Flashcard {
  question: string;
  answer: string;
}

interface FlashcardsProps {
  flashcards: Flashcard[];
}

export default function Flashcards({ flashcards }: FlashcardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completed, setCompleted] = useState<number[]>([]);

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleMastered = () => {
    if (!completed.includes(currentIndex)) {
      setCompleted([...completed, currentIndex]);
      if (completed.length + 1 === flashcards.length) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
    handleNext();
  };

  const activeCard = flashcards[currentIndex];
  const progress = ((completed.length / flashcards.length) * 100).toFixed(0);

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-5xl font-display font-extrabold uppercase italic">Study Deck</h2>
        <div className="flex items-center justify-center gap-4">
          <div className="h-4 w-64 bg-white border-2 border-neo-black overflow-hidden">
            <motion.div 
               className="h-full bg-neo-green"
               initial={{ width: 0 }}
               animate={{ width: `${progress}%` }}
            />
          </div>
          <span className="font-bold text-sm">{progress}% Mastered</span>
        </div>
      </div>

      <div className="relative h-[400px] perspective-1000">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 90, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <div 
              onClick={handleFlip}
              className={`
                w-full h-full neo-card cursor-pointer flex flex-col items-center justify-center p-12 text-center transition-all duration-500 transform-style-preserve-3d relative
                ${isFlipped ? 'rotate-y-180 bg-neo-blue text-white' : 'bg-white'}
              `}
            >
              <div className={`transition-opacity duration-300 ${isFlipped ? 'opacity-0 invisible' : 'opacity-100 visible'}`}>
                <span className="absolute top-4 right-4 text-xs font-bold uppercase opacity-50">Question</span>
                <p className="text-3xl font-bold leading-tight">{activeCard.question}</p>
                <div className="mt-8 flex items-center gap-2 justify-center text-neo-pink">
                  <RotateCcw className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Click to Flip</span>
                </div>
              </div>

              <div className={`absolute inset-0 flex flex-col items-center justify-center p-12 transition-opacity duration-300 transform rotate-y-180 ${isFlipped ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                <span className="absolute top-4 right-4 text-xs font-bold uppercase opacity-50">Answer</span>
                <p className="text-3xl font-bold leading-tight">{activeCard.answer}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between gap-4">
        <button onClick={handlePrev} className="neo-button bg-white p-4">
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <div className="flex flex-1 gap-4">
          <button 
            onClick={handleMastered}
            className="flex-1 neo-button bg-neo-green hover:bg-green-400 text-neo-black"
          >
            Mastered!
          </button>
          <button 
            onClick={handleNext}
            className="flex-1 neo-button bg-neo-pink text-white"
          >
            Review Later
          </button>
        </div>

        <button onClick={handleNext} className="neo-button bg-white p-4">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
