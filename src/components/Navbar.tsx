import React from 'react';
import { motion } from 'motion/react';
import { 
  Upload, 
  FileText, 
  Layers, 
  MessageSquare, 
  Ghost,
  Sparkles,
  Flower
} from 'lucide-react';

type Tab = 'upload' | 'sheet' | 'flashcards' | 'chat' | 'game' | 'bloom';

interface NavbarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  hasData: boolean;
}

export default function Navbar({ activeTab, setActiveTab, hasData }: NavbarProps) {
  const tabs = [
    { id: 'upload' as const, label: 'Upload', icon: Upload },
    { id: 'sheet' as const, label: 'Sheet', icon: FileText, disabled: !hasData },
    { id: 'flashcards' as const, label: 'Deck', icon: Layers, disabled: !hasData },
    { id: 'chat' as const, label: 'AI Chat', icon: MessageSquare, disabled: false },
    { id: 'game' as const, label: 'ClueNote', icon: Ghost, disabled: !hasData },
    { id: 'bloom' as const, label: 'Bloom', icon: Flower, disabled: false },
  ];

  return (
    <nav className="border-b-4 border-neo-black bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => setActiveTab('upload')}
        >
          <div className="bg-neo-yellow border-2 border-neo-black p-1 shadow-[2px_2px_0px_#1A1A1B] group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-[1px_1px_0px_#1A1A1B] transition-all">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="font-display font-extra-bold text-2xl tracking-tighter uppercase">
            MEMORA
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isDisabled = tab.disabled;

            return (
              <button
                key={tab.id}
                disabled={isDisabled}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 font-bold uppercase text-sm border-2 border-neo-black transition-all
                  ${isDisabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'cursor-pointer hover:translate-x-[2px] hover:translate-y-[2px]'}
                  ${isActive ? 'bg-neo-pink text-white shadow-none translate-x-[2px] translate-y-[2px]' : 'bg-white shadow-[2px_2px_0px_#1A1A1B]'}
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
