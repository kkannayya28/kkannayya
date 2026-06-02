import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Ghost, 
  Search, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  HelpCircle,
  Eye,
  Key
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface GameData {
  title: string;
  case: string;
  clues: string[];
  answer: string;
  suspect: string;
}

interface ClueNoteGameProps {
  notes: string;
}

export default function ClueNoteGame({ notes }: ClueNoteGameProps) {
  const [game, setGame] = useState<GameData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [isSolved, setIsSolved] = useState<boolean | null>(null);
  const [visibleClues, setVisibleClues] = useState(0);

  const startNewGame = async () => {
    setIsLoading(true);
    setGame(null);
    setIsSolved(null);
    setUserAnswer('');
    setVisibleClues(0);
    try {
      const response = await fetch('/api/cluenote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      });
      const data = await response.json();
      setGame(data);
    } catch (error) {
      console.error('Game failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (notes && !game) startNewGame();
  }, [notes]);

  const handleSolve = () => {
    // Basic fuzzy check just for demo, usually AI should check this but let's keep it simple
    // or we could add another API endpoint for evaluation.
    // For now, let's just reveal the answer and let the user decide if they were right.
    setIsSolved(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-neo-pink" />
        <h2 className="text-2xl font-bold uppercase animate-pulse">Constructing the Mystery...</h2>
      </div>
    );
  }

  if (!game) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-block bg-neo-black text-white px-4 py-1 font-black uppercase tracking-widest text-sm mb-4">
          Operation: ClueNote
        </div>
        <h2 className="text-6xl font-display font-extrabold uppercase italic leading-none">
          {game.title}
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div className="neo-card p-8 bg-white border-neo-black relative">
             <div className="absolute -top-4 -left-4 bg-neo-pink text-white border-2 border-neo-black px-4 py-1 font-bold italic shadow-[4px_4px_0px_#1A1A1B]">
              THE CASE
            </div>
            <p className="text-xl font-medium leading-relaxed italic">
              "{game.case}"
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-bold uppercase flex items-center gap-2">
              <Search className="w-6 h-6" />
              Evidence & Clues
            </h3>
            <div className="space-y-4">
              {game.clues.map((clue, i) => (
                <motion.div
                  key={i}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.2 }}
                  className={`
                    neo-card p-6 flex gap-4 items-start transition-all
                    ${visibleClues > i ? 'bg-neo-blue text-white' : 'bg-gray-100 opacity-40'}
                  `}
                >
                   <div className={`p-2 border-2 border-neo-black ${visibleClues > i ? 'bg-white' : 'bg-gray-200'}`}>
                    {visibleClues > i ? <Eye className="w-5 h-5 text-neo-black" /> : <Key className="w-5 h-5 text-gray-500" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold uppercase text-xs mb-1">Clue #{i + 1}</div>
                    <p className="font-bold">
                       {visibleClues > i ? clue : "Unlock this clue by solving the mystery step by step..."}
                    </p>
                  </div>
                  {visibleClues === i && (
                    <button 
                      onClick={() => setVisibleClues(i + 1)}
                      className="neo-button !py-1 !px-3 bg-neo-yellow text-neo-black text-xs"
                    >
                      Investigate
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
           <div className="neo-card p-6 bg-neo-yellow border-neo-black">
             <div className="text-center mb-4">
               <div className="w-24 h-24 bg-white border-4 border-neo-black mx-auto overflow-hidden flex items-center justify-center mb-2">
                 <Ghost className="w-12 h-12" />
               </div>
               <h4 className="font-bold uppercase text-sm">Target Suspect</h4>
               <p className="font-display font-extrabold text-2xl">{game.suspect}</p>
             </div>
           </div>

           <div className="neo-card p-6 bg-white space-y-4">
             <h4 className="font-bold uppercase text-center border-b-2 border-neo-black pb-2 mb-4">Solve the Mystery</h4>
             <textarea
               className="w-full neo-input h-32 text-sm"
               placeholder="Who is the culprit? What happened according to the notes?"
               value={userAnswer}
               onChange={(e) => setUserAnswer(e.target.value)}
               disabled={isSolved === true}
             />
             <button
               onClick={handleSolve}
               disabled={!userAnswer || isSolved === true}
               className="w-full neo-button bg-neo-pink text-white disabled:opacity-50"
             >
               Confirm Accusation
             </button>
             {isSolved && (
               <motion.div
                 initial={{ scale: 0.8, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 className="mt-4 p-4 bg-neo-green border-4 border-neo-black font-bold text-sm space-y-2"
               >
                 <div className="flex items-center gap-2 mb-2">
                   <CheckCircle2 className="w-5 h-5" />
                   CASE SOLVED
                 </div>
                 <p className="text-xs italic leading-tight">The Truth: {game.answer}</p>
               </motion.div>
             )}
           </div>
           
           <button 
            onClick={startNewGame}
            className="w-full neo-button bg-neo-black text-white text-xs"
           >
             Another Case?
           </button>
        </div>
      </div>
    </div>
  );
}
