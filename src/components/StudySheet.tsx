import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Lightbulb, 
  Map as MapIcon, 
  ArrowRight,
  BrainCircuit,
  Info,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { StudyData } from '../App';

interface StudySheetProps {
  data: StudyData;
}

export default function StudySheet({ data }: StudySheetProps) {
  // Automatically highlight the first Node of the concept map on load to engage the student
  const [selectedNode, setSelectedNode] = useState<typeof data.mindMap.nodes[0] | null>(null);

  useEffect(() => {
    if (data?.mindMap?.nodes?.length > 0) {
      setSelectedNode(data.mindMap.nodes[0]);
    } else {
      setSelectedNode(null);
    }
  }, [data]);

  const activeExplanation = selectedNode?.explanation || 
    (selectedNode ? `This node represents "${selectedNode.label}", an integral structural component extracted from your loaded academic notes material. Explore related ideas to synthesize permanent retention patterns!` : "");

  return (
    <div className="space-y-12 pb-12">
      {/* Summary Section */}
      <section className="relative">
        <div className="absolute -top-6 -left-6 bg-neo-pink border-2 border-neo-black px-4 py-1 font-bold text-white z-10 shadow-[4px_4px_0px_#1A1A1B] uppercase tracking-wider">
          The Breakdown
        </div>
        <div className="neo-card p-8 pt-10 bg-white">
          <div className="markdown-body prose prose-lg max-w-none">
            <ReactMarkdown>{data.summary}</ReactMarkdown>
          </div>
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-8 items-stretch">
        {/* Mind Map Section (Visual Representation & Detailed Interactive Explanations) */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-display font-extrabold text-3xl uppercase italic underline decoration-neo-blue decoration-8 underline-offset-4">
              <MapIcon className="w-8 h-8" />
              Concept Map
            </div>
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
              👈 Tap nodes to learn more
            </span>
          </div>

          <div className="neo-card flex-1 min-h-[350px] bg-[#FAF9F6] p-6 relative flex flex-col justify-between overflow-hidden border-4 border-neo-black shadow-[4px_4px_0px_#1A1A1B]">
            {/* Interactive Nodes Loop */}
            <div className="relative z-10 flex flex-wrap gap-3 justify-center items-center py-6">
              {(data.mindMap?.nodes || []).map((node, i) => {
                const isSelected = selectedNode?.id === node.id;
                return (
                  <motion.button
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={`
                      p-3 font-bold text-sm tracking-tight border-2 transition-all relative select-none cursor-pointer text-left
                      ${isSelected 
                        ? 'bg-neo-pink text-white border-neo-black shadow-[2px_2px_0px_#1A1A1B] translate-x-[2px] translate-y-[2px]' 
                        : 'bg-neo-blue text-white border-neo-black hover:bg-neo-blue/90 shadow-[4px_4px_0px_#1A1A1B] active:translate-x-[1px] active:translate-y-[1px]'
                      }
                    `}
                  >
                    <div className="flex items-center gap-1.5">
                      <Sparkles className={`w-3.5 h-3.5 ${isSelected ? 'animate-spin' : ''}`} />
                      {node.label}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Explanations Display Drawer */}
            <AnimatePresence mode="wait">
              {selectedNode && (
                <motion.div
                  key={selectedNode.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="relative z-10 mt-6 p-4 bg-white border-2 border-neo-black shadow-[4px_4px_0px_#1A1A1B] space-y-2 text-left"
                >
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-neo-pink">
                    <Info className="w-4 h-4" /> Selected Concept: {selectedNode.label}
                  </div>
                  <p className="text-xs font-medium text-gray-700 leading-relaxed">
                    {activeExplanation}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Decorative Grid */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
              style={{ backgroundImage: 'radial-gradient(#1A1A1B 1px, transparent 0)', backgroundSize: '20px 20px' }} 
            />
          </div>
        </section>

        {/* Fun Fact Section */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2 font-display font-extrabold text-3xl uppercase italic underline decoration-neo-yellow decoration-8 underline-offset-4">
            <Lightbulb className="w-8 h-8" />
            Did you know?
          </div>
          <div className="neo-card flex-1 bg-neo-yellow p-8 flex flex-col justify-center text-center italic font-medium text-xl leading-relaxed border-4 border-neo-black shadow-[4px_4px_0px_#1A1A1B]">
            "{data.funFact}"
          </div>
        </section>
      </div>

      {/* Quick Quiz Call to Action */}
      <div className="neo-card p-12 bg-neo-black text-white flex flex-col md:flex-row items-center justify-between gap-8 border-4 border-neo-black">
        <div className="space-y-4 text-center md:text-left">
          <h2 className="text-4xl font-display font-extrabold uppercase">Ready for a challenge?</h2>
          <p className="text-xl opacity-80 max-w-md">Try the Memory Bloom exercises or custom ClueNote cases based on these topics.</p>
        </div>
        <div className="bg-neo-green border-4 border-white p-6 text-neo-black font-extrabold text-2xl shadow-[8px_8px_0px_#6BCB77] rotate-3 hover:rotate-0 transition-transform cursor-pointer">
          START THE CHALLENGE
        </div>
      </div>
    </div>
  );
}
