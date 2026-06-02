import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flower, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Info, 
  Flame, 
  Globe, 
  Layers,
  Droplet,
  Sun,
  Sprout,
  Heart,
  Plus,
  Trash2,
  ListRestart
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  concept: string;
  flowerType: string;
}

interface PlantedFlower {
  id: string;
  concept: string;
  flowerType: string;
  stage: number; // 0: seed, 1: sprout, 2: bud, 3: blooming, 4: full glory
  waterCount: number;
  sunCount: number;
  requiredWater: number;
  requiredSun: number;
  plantedDate: string;
}

const arenas = [
  { id: 'math', label: 'Advanced Algebra', icon: Layers, prompt: 'Linear Algebra, Calculus, and Quadratic Equations' },
  { id: 'bio', label: 'Cellular Biology', icon: Heart, prompt: 'Cell organelles, DNA replication, and Photosynthesis' },
  { id: 'history', label: 'Ancient Civilizations', icon: Globe, prompt: 'Rise and architecture of Ancient Rome, Egypt, and Greece' },
  { id: 'chem', label: 'Organic Chemistry', icon: Sprout, prompt: 'Carbon bonds, hydrocarbons, and chemical reactions' },
];

const flowerSpecies: Record<string, { 
  emoji: string; 
  growthEmojis: string[]; 
  color: string; 
  accentColor: string;
  trivia: string; 
}> = {
  "Neon Orchid": { 
    emoji: "🌸", 
    growthEmojis: ["🌱", "🌿", "🪴", "🪻", "🌸"], 
    color: "bg-[#FF6B6B]", 
    accentColor: "border-neo-pink",
    trivia: "Emits high-frequency bioluminescence indicating high recall rates." 
  },
  "Sunfire Sunflower": { 
    emoji: "🌻", 
    growthEmojis: ["🌱", "🍀", "🪴", "🌱", "🌻"], 
    color: "bg-[#FFE600]", 
    accentColor: "border-neo-yellow",
    trivia: "Tracks active brain wavelengths and aligns perfectly with morning focus periods." 
  },
  "Chrono Lotus": { 
    emoji: "🪷", 
    growthEmojis: ["🌱", "☘️", "🪴", "🪷", "🪷"], 
    color: "bg-[#A78BFA]", 
    accentColor: "border-[#8B5CF6]",
    trivia: "Bends the perceived flow of study time, making hard sessions feel like minutes." 
  },
  "Cyber Violet": { 
    emoji: "🪻", 
    growthEmojis: ["🌱", "🌿", "🪴", "🪻", "🪻"], 
    color: "bg-[#4D96FF]", 
    accentColor: "border-[#3B82F6]",
    trivia: "Features neural-stems that anchor deep facts firmly within memory folds." 
  },
  "Glyph Rose": { 
    emoji: "🌹", 
    growthEmojis: ["🌱", "🎋", "🪴", "🥀", "🌹"], 
    color: "bg-red-400", 
    accentColor: "border-red-600",
    trivia: "Petals arranged in perfect fractal equations representation." 
  },
  "Hydra Fern": { 
    emoji: "🌿", 
    growthEmojis: ["🌱", "🌿", "🌿", "🪴", "🌿"], 
    color: "bg-[#6BCB77]", 
    accentColor: "border-neo-green",
    trivia: "Each frond regenerates automatically through spaced repetition." 
  },
};

const defaultSpecies = {
  emoji: "🌼",
  growthEmojis: ["🌱", "🌿", "🪴", "🪴", "🌼"],
  color: "bg-white",
  accentColor: "border-neo-black",
  trivia: "Standard study flora that brightens any brutalist desk layout."
};

export default function MemoryBloom({ notes }: { notes: string }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Growth resources
  const [waterDroplets, setWaterDroplets] = useState<number>(0);
  const [sunEnergy, setSunEnergy] = useState<number>(0);
  
  // Plant inventory
  const [gardenPlots, setGardenPlots] = useState<PlantedFlower[]>([]);
  const [selectedPlotIdx, setSelectedPlotIdx] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);

  // Loads garden values from LocalStorage
  useEffect(() => {
    const savedPlots = localStorage.getItem('memora_garden_plots');
    const savedWater = localStorage.getItem('memora_garden_water');
    const savedSun = localStorage.getItem('memora_garden_sun');
    if (savedPlots) {
      setGardenPlots(JSON.parse(savedPlots));
    } else {
      // 6 Default plots (three preloaded with seeds for beautiful start)
      const initial: PlantedFlower[] = [
        { id: 'p0', concept: 'Photosynthesis', flowerType: 'Sunfire Sunflower', stage: 1, waterCount: 1, sunCount: 0, requiredWater: 3, requiredSun: 2, plantedDate: new Date().toLocaleDateString() },
        { id: 'p1', concept: 'Calculus Limits', flowerType: 'Chrono Lotus', stage: 2, waterCount: 2, sunCount: 1, requiredWater: 4, requiredSun: 3, plantedDate: new Date().toLocaleDateString() },
        { id: 'p2', concept: 'Genetics', flowerType: 'Neon Orchid', stage: 4, waterCount: 5, sunCount: 5, requiredWater: 5, requiredSun: 5, plantedDate: new Date().toLocaleDateString() },
        { id: 'p3', concept: '', flowerType: '', stage: 0, waterCount: 0, sunCount: 0, requiredWater: 0, requiredSun: 0, plantedDate: '' },
        { id: 'p4', concept: '', flowerType: '', stage: 0, waterCount: 0, sunCount: 0, requiredWater: 0, requiredSun: 0, plantedDate: '' },
        { id: 'p5', concept: '', flowerType: '', stage: 0, waterCount: 0, sunCount: 0, requiredWater: 0, requiredSun: 0, plantedDate: '' },
      ];
      setGardenPlots(initial);
      localStorage.setItem('memora_garden_plots', JSON.stringify(initial));
    }
    if (savedWater) setWaterDroplets(parseInt(savedWater));
    else setWaterDroplets(3); // Start with some water

    if (savedSun) setSunEnergy(parseInt(savedSun));
    else setSunEnergy(2); // Start with some sun
  }, []);

  const saveGardenState = (plots: PlantedFlower[], water: number, sun: number) => {
    localStorage.setItem('memora_garden_plots', JSON.stringify(plots));
    localStorage.setItem('memora_garden_water', water.toString());
    localStorage.setItem('memora_garden_sun', sun.toString());
  };

  const loadQuestions = async (arenaPrompt?: string) => {
    setIsLoading(true);
    setQuestions([]);
    setCurrentIdx(0);
    setSelectedOpt(null);
    setHasSubmitted(false);

    try {
      const response = await fetch('/api/memory-bloom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: arenaPrompt ? "" : notes,
          topic: arenaPrompt || ""
        })
      });
      const data = await response.json();
      if (data.questions) {
        setQuestions(data.questions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (notes) {
      loadQuestions();
    }
  }, [notes]);

  const handleChoiceSubmit = () => {
    if (selectedOpt === null) return;
    setHasSubmitted(true);
    const q = questions[currentIdx];

    if (selectedOpt === q.correctIndex) {
      // Correct! Unlock nutrients
      const newWater = waterDroplets + 2;
      const newSun = sunEnergy + 1;
      setWaterDroplets(newWater);
      setSunEnergy(newSun);
      setStreak(prev => prev + 1);

      // Trigger beautiful confetti
      confetti({
        particleCount: 80,
        spread: 45,
        origin: { y: 0.8 }
      });

      // Show options to plant or upgrade
      // Find empty spot in garden and automatically draft/incubate a seed
      const emptyIdx = gardenPlots.findIndex(p => p.stage === 0);
      let updatedPlots = [...gardenPlots];
      if (emptyIdx !== -1) {
        updatedPlots[emptyIdx] = {
          id: `plant-${Date.now()}`,
          concept: q.concept || "Global Theory",
          flowerType: q.flowerType || "Cyber Violet",
          stage: 1, // Start as Seed
          waterCount: 0,
          sunCount: 0,
          requiredWater: Math.floor(Math.random() * 3) + 3, // 3 - 5
          requiredSun: Math.floor(Math.random() * 2) + 2, // 2 - 3
          plantedDate: new Date().toLocaleDateString()
        };
        setGardenPlots(updatedPlots);
      }
      saveGardenState(updatedPlots, newWater, newSun);
    } else {
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOpt(null);
    setHasSubmitted(false);
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setQuestions([]); // Finished current batch of study notes
    }
  };

  const handleWater = (plotIdx: number) => {
    if (waterDroplets <= 0) return;
    const plot = gardenPlots[plotIdx];
    if (plot.stage === 0) return; // empty plot
    if (plot.stage === 4) {
      alert("✨ This marvelous plant has achieved peak Full Bloom and cannot grow further!");
      return;
    }

    const nextWater = waterDroplets - 1;
    setWaterDroplets(nextWater);

    const updatedPlots = [...gardenPlots];
    const targetPlot = { ...plot };
    targetPlot.waterCount += 1;

    // Check growth progress
    evaluateGrowth(targetPlot);

    updatedPlots[plotIdx] = targetPlot;
    setGardenPlots(updatedPlots);
    saveGardenState(updatedPlots, nextWater, sunEnergy);

    confetti({
      particleCount: 20,
      colors: ['#3B82F6', '#60A5FA', '#93C5FD'],
      origin: { y: 0.8 }
    });
  };

  const handleSunlight = (plotIdx: number) => {
    if (sunEnergy <= 0) return;
    const plot = gardenPlots[plotIdx];
    if (plot.stage === 0) return; // empty plot
    if (plot.stage === 4) {
      alert("✨ This marvelous plant has achieved peak Full Bloom and cannot grow further!");
      return;
    }

    const nextSun = sunEnergy - 1;
    setSunEnergy(nextSun);

    const updatedPlots = [...gardenPlots];
    const targetPlot = { ...plot };
    targetPlot.sunCount += 1;

    // Check growth progress
    evaluateGrowth(targetPlot);

    updatedPlots[plotIdx] = targetPlot;
    setGardenPlots(updatedPlots);
    saveGardenState(updatedPlots, waterDroplets, nextSun);

    confetti({
      particleCount: 25,
      colors: ['#FFE600', '#FBBF24', '#FCD34D'],
      origin: { y: 0.8 }
    });
  };

  const evaluateGrowth = (plot: PlantedFlower) => {
    // Stage thresholds based on relative percentage of required components
    const totalRequired = plot.requiredWater + plot.requiredSun;
    const totalPossessed = plot.waterCount + plot.sunCount;

    if (totalPossessed >= totalRequired) {
      if (plot.stage !== 4) {
        plot.stage = 4; // Full Bloom
        // Grand celebration explosion
        setTimeout(() => {
          confetti({
            particleCount: 150,
            spread: 90,
            scalar: 1.2
          });
        }, 300);
      }
    } else {
      const completionRatio = totalPossessed / totalRequired;
      if (completionRatio >= 0.7) {
        plot.stage = 3; // Blooming
      } else if (completionRatio >= 0.4) {
        plot.stage = 2; // Sprout / Bud
      } else {
        plot.stage = 1; // Seed
      }
    }
  };

  const handleUproot = (plotIdx: number) => {
    if (window.confirm("🗑️ Are you sure you want to uproot this memory blossom and clear the plot? This cannot be undone!")) {
      const updatedPlots = [...gardenPlots];
      updatedPlots[plotIdx] = {
        id: `p-${Date.now()}`,
        concept: '',
        flowerType: '',
        stage: 0,
        waterCount: 0,
        sunCount: 0,
        requiredWater: 0,
        requiredSun: 0,
        plantedDate: ''
      };
      setGardenPlots(updatedPlots);
      saveGardenState(updatedPlots, waterDroplets, sunEnergy);
      setSelectedPlotIdx(null);
    }
  };

  const handleRestartGarden = () => {
    if (window.confirm("🚨 Reset entire garden layout, clean inventory, and wipe resource stats?")) {
      const resetPlots = Array.from({ length: 6 }).map((_, i) => ({
        id: `p-${i}-${Date.now()}`,
        concept: '',
        flowerType: '',
        stage: 0,
        waterCount: 0,
        sunCount: 0,
        requiredWater: 0,
        requiredSun: 0,
        plantedDate: ''
      }));
      setGardenPlots(resetPlots);
      setWaterDroplets(3);
      setSunEnergy(2);
      saveGardenState(resetPlots, 3, 2);
      setStreak(0);
      setSelectedPlotIdx(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-16">
      {/* Neo-brutalist Jumbotron */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-neo-green border-2 border-neo-black px-4 py-1.5 font-black uppercase text-xs tracking-widest text-neo-black shadow-[2px_2px_0px_#000]">
          <Flower className="w-4 h-4" /> Mode: Memory Bloom
        </div>
        <h1 className="text-5xl md:text-6xl font-display font-extrabold uppercase tracking-tight">
          THE MEMORY <span className="bg-neo-pink text-white px-2 inline-block rotate-1">BLOOM</span> GARDEN
        </h1>
        <p className="text-lg font-medium text-gray-600 max-w-2xl mx-auto">
          Map academic achievements into brilliant bioluminescent digital flora. Crack quizzes to gain vital nutrients, plant unique seeds, and nurture botanical structures based on your real lecture notes!
        </p>
      </div>

      {/* Resource Topbar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="neo-card p-4 bg-neo-blue text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplet className="w-6 h-6 fill-white" />
            <span className="font-display font-black text-xl">WATER Droplets</span>
          </div>
          <span className="font-extrabold text-2xl bg-white text-neo-black px-3 py-1 border-2 border-neo-black">
            {waterDroplets}💧
          </span>
        </div>

        <div className="neo-card p-4 bg-neo-yellow text-neo-black flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun className="w-6 h-6 fill-neo-black" />
            <span className="font-display font-black text-xl">SUN ENERGY</span>
          </div>
          <span className="font-extrabold text-2xl bg-white text-neo-black px-3 py-1 border-2 border-neo-black">
            {sunEnergy}☀️
          </span>
        </div>

        <div className="neo-card p-4 bg-white text-neo-black flex items-center justify-between col-span-2 md:col-span-2">
          <div className="flex items-center gap-2">
            <Sprout className="w-6 h-6 text-neo-green" />
            <span className="font-display font-black text-lg">GARDEN MATURITY</span>
          </div>
          <span className="font-black text-lg uppercase bg-neo-green text-neo-black px-3 py-1 border-2 border-neo-black">
            {gardenPlots.filter(p => p.stage === 4).length} / 6 Bloomed
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Hand: Garden Botanical Display */}
        <div className="lg:col-span-7 space-y-6">
          <div className="neo-card p-6 bg-white border-neo-black relative overflow-hidden">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />
            
            <div className="flex items-center justify-between border-b-4 border-neo-black pb-4 mb-6 relative">
              <h3 className="text-2xl font-display font-extrabold uppercase flex items-center gap-2">
                <Flower className="w-6 h-6 text-neo-pink" /> Botanical Shelf
              </h3>
              <button 
                onClick={handleRestartGarden}
                title="Wipe garden layout"
                className="text-xs font-bold border-2 border-neo-black px-2 py-1 bg-white hover:bg-neo-pink hover:text-white uppercase select-none cursor-pointer"
              >
                Clear Garden
              </button>
            </div>

            {/* Shelf Grid Layout */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 relative">
              {gardenPlots.map((plot, idx) => {
                const spec = plot.flowerType ? (flowerSpecies[plot.flowerType] || defaultSpecies) : null;
                const isSelected = selectedPlotIdx === idx;
                
                return (
                  <div
                    key={plot.id}
                    onClick={() => setSelectedPlotIdx(idx)}
                    className={`
                      neo-card cursor-pointer p-4 flex flex-col items-center justify-between h-56 transition-all text-center relative select-none
                      ${isSelected ? 'bg-neo-blue/10 border-neo-blue shadow-none translate-x-[2px] translate-y-[2px]' : 'bg-white'}
                      ${plot.stage === 4 ? 'ring-4 ring-neo-green ring-offset-2' : ''}
                    `}
                  >
                    {/* Plot indicator */}
                    <span className="absolute top-2 left-2 bg-neo-black text-white text-[9px] font-black px-1 uppercase leading-none rounded-none">
                      P{idx + 1}
                    </span>

                    {/* Flower Growth Illustration Stage */}
                    <div className="flex-1 flex items-center justify-center relative min-h-[100px] w-full">
                      {plot.stage > 0 && spec ? (
                        <div className="relative">
                          {/* Pulsing circular aura behind bloomed plants */}
                          {plot.stage === 4 && (
                            <div className="absolute inset-0 bg-neo-yellow/20 rounded-full blur-xl scale-125 animate-pulse" />
                          )}
                          <motion.span 
                            className="text-6xl inline-block"
                            animate={plot.stage === 4 ? {
                              rotate: [0, -3, 3, -3, 0],
                              scale: [1, 1.04, 1, 1.04, 1]
                            } : {}}
                            transition={{ repeat: Infinity, duration: 4 }}
                          >
                            {spec.growthEmojis[plot.stage] || spec.emoji}
                          </motion.span>
                        </div>
                      ) : (
                        <span className="text-gray-300 font-extrabold uppercase text-[10px] tracking-wide border-2 border-dashed border-gray-200 p-4">
                          🕳️ Empty Plot
                        </span>
                      )}
                    </div>

                    {/* Plant labeling details */}
                    <div className="w-full">
                      {plot.stage > 0 ? (
                        <div className="space-y-1">
                          <p className="font-display font-black text-sm uppercase tracking-tight truncate max-w-full">
                            {plot.concept}
                          </p>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 border border-neo-black ${spec?.color} ${plot.stage === 4 ? 'text-neo-black font-black uppercase' : 'text-gray-600'}`}>
                            {plot.stage === 4 ? "🌹 Bloomed!" : `${plot.flowerType}`}
                          </span>
                        </div>
                      ) : (
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Ready for seed</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dynamic details drawer for selected flower plot */}
            <AnimatePresence mode="wait">
              {selectedPlotIdx !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="mt-6 p-4 border-4 border-neo-black bg-[#FAF9F6] relative space-y-4"
                >
                  {/* Exit Drawer clicker */}
                  <button 
                    onClick={() => setSelectedPlotIdx(null)}
                    className="absolute top-2 right-2 bg-white border-2 border-neo-black hover:bg-[#FF6B6B] hover:text-white px-1.5 text-xs font-bold"
                  >
                    X
                  </button>

                  {gardenPlots[selectedPlotIdx].stage === 0 ? (
                    <div className="text-center py-6 space-y-2">
                      <p className="font-bold text-gray-500 uppercase text-xs">This plot is completely empty of life.</p>
                      <p className="text-xs text-gray-400">Answer quiz questions on the right to plant concept seed specimens here!</p>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-12 gap-4 items-start">
                      {/* Left: Info summary */}
                      <div className="sm:col-span-8 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-3xl">
                            {flowerSpecies[gardenPlots[selectedPlotIdx].flowerType]?.emoji}
                          </span>
                          <div>
                            <h4 className="font-display font-black text-xl uppercase tracking-tight">
                              {gardenPlots[selectedPlotIdx].concept}
                            </h4>
                            <span className="text-xs text-gray-500 font-extrabold uppercase tracking-widest">
                              Species: {gardenPlots[selectedPlotIdx].flowerType}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-gray-700 italic leading-relaxed font-semibold">
                          🧬 Trivia: {flowerSpecies[gardenPlots[selectedPlotIdx].flowerType]?.trivia}
                        </p>

                        <div className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase">
                          Planted Epoch: {gardenPlots[selectedPlotIdx].plantedDate}
                        </div>
                      </div>

                      {/* Right: Nourishment Growth Mechanics */}
                      <div className="sm:col-span-4 space-y-2 border-t-2 sm:border-t-0 sm:border-l-2 border-neo-black pt-3 sm:pt-0 sm:pl-4">
                        <div className="font-bold text-xs uppercase text-neo-pink tracking-wider">Maturity Status</div>
                        
                        <div className="text-xs font-bold space-y-1">
                          <div className="flex justify-between">
                            <span>💧 Watered:</span>
                            <span className="font-mono">{gardenPlots[selectedPlotIdx].waterCount} / {gardenPlots[selectedPlotIdx].requiredWater}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>☀️ Solarizer:</span>
                            <span className="font-mono">{gardenPlots[selectedPlotIdx].sunCount} / {gardenPlots[selectedPlotIdx].requiredSun}</span>
                          </div>
                        </div>

                        {gardenPlots[selectedPlotIdx].stage < 4 ? (
                          <div className="grid grid-cols-2 gap-2 pt-2">
                            <button
                              onClick={() => handleWater(selectedPlotIdx)}
                              disabled={waterDroplets <= 0}
                              className="neo-button bg-neo-blue text-white text-[10px] !p-2 flex flex-col items-center justify-center gap-1 disabled:opacity-40"
                            >
                              <Droplet className="w-3 h-3 fill-white" />
                              Pour Water
                            </button>
                            <button
                              onClick={() => handleSunlight(selectedPlotIdx)}
                              disabled={sunEnergy <= 0}
                              className="neo-button bg-neo-yellow text-neo-black text-[10px] !p-2 flex flex-col items-center justify-center gap-1 disabled:opacity-40"
                            >
                              <Sun className="w-3 h-3" />
                              Add Light
                            </button>
                          </div>
                        ) : (
                          <div className="bg-neo-green font-bold text-center border-2 border-neo-black text-[10px] uppercase text-neo-black py-1 tracking-wider rotate-2">
                            🌸 Maximum Glory
                          </div>
                        )}

                        <div className="pt-2">
                          <button
                            onClick={() => handleUproot(selectedPlotIdx)}
                            className="w-full text-[10px] font-black uppercase text-[#FF6B6B] hover:text-white hover:bg-[#FF6B6B] border border-[#FF6B6B] hover:border-neo-black p-1 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" /> Uproot Plant
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Hand: AI Bloom Botanical Quizzes */}
        <div className="lg:col-span-5 space-y-6">
          {isLoading ? (
            <div className="neo-card p-12 bg-white flex flex-col items-center justify-center text-center gap-4">
              <Sprout className="w-16 h-16 animate-bounce text-neo-pink" />
              <div className="font-display font-black text-2xl uppercase tracking-wider animate-pulse">
                Synthesizing Bloom Nutrients...
              </div>
              <p className="font-semibold text-gray-500">Formulating custom Multiple Choice questions.</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="neo-card p-8 bg-white border-neo-black space-y-6">
              <div className="text-center space-y-2">
                <HelpCircle className="w-12 h-12 text-[#4D96FF] mx-auto" />
                <h3 className="text-3xl font-display font-extrabold uppercase">Choose Harvest</h3>
                <p className="font-bold text-gray-500">
                  {notes ? "Notes compiled! Tap below to start extracting water and sunshine straight from your curriculum." : "No notes uploaded yet. Start study sessions anyway using these default biological disciplines!"}
                </p>
              </div>

              {notes ? (
                <button
                  onClick={() => loadQuestions()}
                  className="w-full neo-button bg-neo-pink text-white font-extrabold text-lg py-4 flex items-center justify-center gap-2 hover:bg-[#FF6B6B]/90"
                >
                  <Sparkles className="w-5 h-5" />
                  Extract Elements From Notes
                </button>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {arenas.map((ar) => {
                    const Icon = ar.icon;
                    return (
                      <button
                        key={ar.id}
                        onClick={() => {
                          loadQuestions(ar.prompt);
                        }}
                        className="neo-card p-6 bg-white hover:bg-neo-blue/5 transition-colors border-2 text-left flex items-start gap-4 cursor-pointer"
                      >
                        <div className="bg-neo-yellow p-2 border-2 border-neo-black shadow-[2px_2px_0px_#000]">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-display font-bold text-sm uppercase tracking-tight">{ar.label}</h4>
                          <span className="text-[9px] font-bold text-neo-pink uppercase tracking-widest">Select Harvest</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="neo-card p-8 bg-white space-y-8 relative">
              {/* Question progress and stats */}
              <div className="flex items-center justify-between border-b-4 border-neo-black pb-4">
                <div className="flex items-center gap-3">
                  <span className="bg-neo-black text-white px-3 py-1 font-black uppercase text-xs tracking-wider border-2 border-neo-black">
                    Q {currentIdx + 1} of {questions.length}
                  </span>
                  {streak > 0 && (
                    <span className="bg-neo-pink text-white px-3 py-1 font-black uppercase text-xs tracking-wider border-2 border-neo-black flex items-center gap-1 animate-pulse">
                      <Flame className="w-4 h-4 fill-white" /> Streak: {streak}
                    </span>
                  )}
                </div>
                <div className="font-mono text-xs font-bold bg-[#FAF9F6] px-2 py-1 border-2 border-neo-black uppercase">
                  Seed reward: {questions[currentIdx].flowerType}
                </div>
              </div>

              {/* Question Content */}
              <div className="space-y-3">
                <div className="text-xs font-black uppercase tracking-widest text-[#FF6B6B]">
                  ACADEMIC DOMAIN // {questions[currentIdx].concept || "KNOWLEDGE PLOT"}
                </div>
                <h3 className="text-2xl font-display font-extrabold leading-tight">
                  {questions[currentIdx].question}
                </h3>
              </div>

              {/* Multiple Choice Options */}
              <div className="space-y-4">
                {questions[currentIdx].options.map((opt, i) => {
                  const isSelected = selectedOpt === i;
                  const isCorrect = questions[currentIdx].correctIndex === i;
                  let bgClass = "bg-white hover:bg-neo-blue/5";
                  
                  if (hasSubmitted) {
                    if (isCorrect) bgClass = "bg-neo-green/30 border-neo-green text-neo-black";
                    else if (isSelected) bgClass = "bg-neo-pink/30 border-neo-pink text-black";
                  } else if (isSelected) {
                    bgClass = "bg-neo-yellow";
                  }

                  return (
                    <button
                      key={i}
                      disabled={hasSubmitted}
                      onClick={() => !hasSubmitted && setSelectedOpt(i)}
                      className={`
                        w-full text-left p-4 border-2 border-neo-black font-bold transition-all flex items-center justify-between gap-4 cursor-pointer
                        ${bgClass}
                        ${isSelected && !hasSubmitted ? 'translate-x-[2px] translate-y-[2px] shadow-none' : 'shadow-[2px_2px_0px_#1A1A1B]'}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <span className="bg-neo-black text-white w-6 h-6 rounded-none flex items-center justify-center text-xs font-black shrink-0">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="text-sm shrink">{opt}</span>
                      </div>
                      {hasSubmitted && isCorrect && <CheckCircle2 className="w-5 h-5 text-neo-green shrink-0" />}
                      {hasSubmitted && isSelected && !isCorrect && <AlertTriangle className="w-5 h-5 text-neo-pink shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Quiz Submit & Explanation Drawer */}
              <div className="pt-4 border-t-2 border-neo-black flex flex-col sm:flex-row gap-4">
                {!hasSubmitted ? (
                  <button
                    disabled={selectedOpt === null}
                    onClick={handleChoiceSubmit}
                    className="flex-1 neo-button bg-neo-black text-white hover:bg-gray-800 disabled:opacity-40 select-none cursor-pointer"
                  >
                    Confirm Answer Choice
                  </button>
                ) : (
                  <div className="w-full space-y-4">
                    <div className="p-4 bg-gray-50 border-2 border-neo-black rounded-none">
                      <div className="flex items-center gap-2 mb-2 font-black text-xs uppercase text-neo-pink">
                        <Info className="w-4 h-4" /> Explanation
                      </div>
                      <p className="text-xs font-semibold text-gray-700 leading-relaxed">
                        {questions[currentIdx].explanation}
                      </p>
                    </div>

                    <div className="p-4 bg-neo-green/20 border-2 border-neo-green text-neo-black text-xs font-bold uppercase tracking-wider relative">
                      {selectedOpt === questions[currentIdx].correctIndex ? (
                        <span>✨ Correct! Gained 2 Water Droplets 💧 and 1 Sunlight ☀️! Drafted a Seed to empty shelves!</span>
                      ) : (
                        <span>❌ Incorrect! Review explanations closely to keep the garden streak alive!</span>
                      )}
                    </div>

                    <button
                      onClick={handleNextQuestion}
                      className="w-full neo-button bg-neo-green font-extrabold text-sm text-neo-black py-3 flex items-center justify-center gap-2"
                    >
                      {currentIdx + 1 === questions.length ? "Harvest Done - Open Shelf" : "Next Harvest Challenge"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
