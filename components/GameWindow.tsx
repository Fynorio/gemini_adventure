import React, { useEffect, useState, useCallback, useRef } from 'react';
import type { Character, GameSettings, StorySegment, InventoryItem, Relationship, Location } from '../types';
import { LoadingSpinner } from './icons/LoadingSpinner';
import { MarkdownRenderer } from './MarkdownRenderer';

// --- Typewriter Component ---
const Typewriter: React.FC<{ text: string, onUpdate: () => void, className?: string, speed?: number }> = ({ text, onUpdate, className, speed = 30 }) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        setDisplayedText('');
        if (!text) return;
        
        const currentIndex = { value: 0 };
        
        const timer = setInterval(() => {
            if (currentIndex.value < text.length) {
                setDisplayedText(prev => prev + text.charAt(currentIndex.value));
                currentIndex.value++;
                onUpdate();
            } else {
                clearInterval(timer);
            }
        }, speed);

        return () => clearInterval(timer);
    }, [text, onUpdate, speed]);

    return <MarkdownRenderer text={displayedText} className={className} />;
};


// --- Reusable Panel Components ---
const Panel: React.FC<{ title: string, icon: React.ReactNode, children: React.ReactNode, initiallyOpen?: boolean }> = ({ title, icon, children, initiallyOpen = true }) => {
    const [isOpen, setIsOpen] = useState(initiallyOpen);
    return (
        <div className="bg-black/20 rounded-lg border border-gray-700/50">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-3 bg-gray-800/40 rounded-t-lg">
                <div className="flex items-center space-x-2">
                    {icon}
                    <h3 className="font-bold text-sm text-gray-200 uppercase tracking-wider">{title}</h3>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isOpen && <div className="p-3 text-sm">{children}</div>}
        </div>
    );
};

const InventoryPanel: React.FC<{ items: InventoryItem[] }> = ({ items }) => (
    <Panel title="Inventory" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-300" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 01-2-2V4zM5 9a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2H5z" /></svg>}>
        {items.length === 0 ? <p className="text-gray-400 italic">Your pockets are empty.</p> : (
            <ul className="space-y-3">
                {items.map(item => (
                    <li key={item.name}>
                        <p className="font-bold text-gray-100">{item.name} {item.quantity > 1 && `(x${item.quantity})`}</p>
                        <p className="text-gray-400">{item.description}</p>
                    </li>
                ))}
            </ul>
        )}
    </Panel>
);

const RelationshipsPanel: React.FC<{ relationships: Relationship[] }> = ({ relationships }) => (
    <Panel title="Connections" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-300" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>}>
        {relationships.length === 0 ? <p className="text-gray-400 italic">You haven't made any notable connections.</p> : (
            <ul className="space-y-3">
                {relationships.map(rel => (
                    <li key={rel.name}>
                        <div className="flex justify-between items-baseline">
                           <p className="font-bold text-gray-100">{rel.name}</p>
                           <span className="text-xs text-amber-400 bg-amber-900/50 px-2 py-0.5 rounded">{rel.status}</span>
                        </div>
                        <p className="text-gray-400">{rel.description}</p>
                    </li>
                ))}
            </ul>
        )}
    </Panel>
);

const LocationsPanel: React.FC<{ locations: Location[] }> = ({ locations }) => (
    <Panel title="World" initiallyOpen={true} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-300" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd" /></svg>}>
         {locations.length === 0 ? <p className="text-gray-400 italic">No locations discovered yet.</p> : (
            <ul className="space-y-3">
                {locations.map(loc => (
                    <li key={loc.name}>
                        <p className="font-bold text-gray-100">{loc.name}</p>
                        <p className="text-gray-400">{loc.description}</p>
                    </li>
                ))}
            </ul>
        )}
    </Panel>
);

const StorySegmentView: React.FC<{ 
    segment: StorySegment,
    isLatest: boolean,
    isOmnireader: boolean,
    onTypewriterUpdate: () => void 
}> = ({ segment, isLatest, isOmnireader, onTypewriterUpdate }) => {
    const isLatestOmniSegment = isLatest && isOmnireader;
    return (
        <div className={`animate-fade-in-fast ${isLatestOmniSegment ? 'p-4 border border-amber-500/50 rounded-lg bg-black/20' : ''}`}>
            {segment.choice && (
                <p className="font-serif-display text-amber-300 italic text-lg my-4">
                    {segment.choice}
                </p>
            )}
            <div className="text-gray-300 leading-relaxed space-y-4">
                {isLatestOmniSegment ? (
                    <Typewriter text={segment.story} onUpdate={onTypewriterUpdate} />
                ) : (
                    <MarkdownRenderer text={segment.story} />
                )}
            </div>
        </div>
    );
};

interface GameWindowProps {
  character: Character | null;
  settings: GameSettings | null;
  storyLog: StorySegment[];
  choices: string[];
  inventory: InventoryItem[];
  relationships: Relationship[];
  locations: Location[];
  onChoiceSelected: (choice: string) => void;
  onSaveGame: () => void;
  isLoading: boolean;
  error: string | null;
  isGameOver: boolean;
  onRestart: () => void;
  isOmnireader: boolean;
}

const OMNIREADER_ACTION = "Continue the story, making a compelling choice for the character.";

export const GameWindow: React.FC<GameWindowProps> = ({
  character,
  settings,
  storyLog,
  choices,
  inventory,
  relationships,
  locations,
  onChoiceSelected,
  onSaveGame,
  isLoading,
  error,
  isGameOver,
  onRestart,
  isOmnireader,
}) => {
  const [customChoice, setCustomChoice] = useState('');
  const storyLogRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (storyLogRef.current) {
        storyLogRef.current.scrollTop = storyLogRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [storyLog, choices, scrollToBottom]);

  const handleCustomChoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customChoice.trim() && !isLoading) {
      onChoiceSelected(customChoice.trim());
      setCustomChoice('');
    }
  };

  const handleOmnireaderContinue = () => {
      if (!isLoading) {
          onChoiceSelected(OMNIREADER_ACTION);
      }
  };

  if (!character || !settings) {
    return <div>Loading character...</div>;
  }

  return (
    <div className="w-full flex flex-col bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-lg shadow-2xl h-[90vh] max-h-[1000px]">
      <header className="flex-shrink-0 flex justify-between items-center p-4 border-b border-gray-700">
        <div>
          <h1 className="text-xl font-bold text-amber-300 font-serif-display">{character.name}</h1>
          <p className="text-sm text-gray-400">{character.role} in a world of {settings.genres.join(', ')}</p>
        </div>
        <div className="flex items-center space-x-2">
            <button onClick={onSaveGame} className="px-3 py-2 text-sm font-semibold bg-gray-700 hover:bg-gray-600 text-amber-300 rounded-md transition">Save</button>
            <button onClick={onRestart} className="px-3 py-2 text-sm font-semibold bg-red-800/70 hover:bg-red-700/70 text-gray-100 rounded-md transition">Restart</button>
        </div>
      </header>
      
      <div className="flex-grow flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-1/3 xl:w-1/4 h-full flex flex-col p-4 border-r border-gray-700 overflow-y-auto space-y-4">
            <InventoryPanel items={inventory} />
            <RelationshipsPanel relationships={relationships} />
            <LocationsPanel locations={locations} />
        </aside>

        {/* Main Content */}
        <main className="w-2/3 xl:w-3/4 flex flex-col overflow-hidden">
          <div ref={storyLogRef} className="flex-grow p-6 space-y-6 overflow-y-auto">
            {storyLog.map((segment, index) => (
              <StorySegmentView 
                key={index} 
                segment={segment}
                isLatest={index === storyLog.length - 1}
                isOmnireader={isOmnireader}
                onTypewriterUpdate={scrollToBottom} 
              />
            ))}
            {isLoading && storyLog.length > 0 && (
                <div className="flex justify-center items-center py-4">
                    <LoadingSpinner />
                    <p className="ml-3 text-gray-400 italic">The story continues...</p>
                </div>
            )}
            {error && <p className="text-red-400 text-center bg-red-900/50 p-3 rounded-md animate-fade-in">{error}</p>}
          </div>
          
          <footer className="flex-shrink-0 p-4 border-t border-gray-700 bg-gray-800/30">
            {isGameOver ? (
                <div className="text-center animate-fade-in">
                    <h2 className="text-2xl font-serif-display text-amber-300">The End</h2>
                    <p className="text-gray-400 mt-2">Your adventure has reached its conclusion.</p>
                    <button onClick={onRestart} className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-gray-900 font-bold rounded-md transition">Start a New Adventure</button>
                </div>
            ) : isOmnireader ? (
                <div className="animate-fade-in">
                    <button 
                        onClick={handleOmnireaderContinue}
                        disabled={isLoading}
                        className="w-full bg-amber-600 hover:bg-amber-500 text-gray-900 font-bold py-3 px-4 rounded-md transition-all duration-300 flex items-center justify-center disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <LoadingSpinner /> : 'Continue'}
                    </button>
                    <p className="text-center text-xs text-gray-500 mt-2">Omnireader Mode: The story will advance when you click continue.</p>
                </div>
            ) : (
                <div className="animate-fade-in space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {choices.map((choice, index) => (
                            <button
                                key={index}
                                onClick={() => !isLoading && onChoiceSelected(choice)}
                                disabled={isLoading}
                                className="w-full text-left p-3 bg-gray-900/70 border border-gray-600 rounded-md hover:bg-amber-900/50 hover:border-amber-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-900/70"
                            >
                                {choice}
                            </button>
                        ))}
                    </div>
                    <form onSubmit={handleCustomChoiceSubmit} className="flex space-x-2">
                        <input
                            type="text"
                            value={customChoice}
                            onChange={(e) => setCustomChoice(e.target.value)}
                            placeholder="Or type your own action..."
                            disabled={isLoading}
                            className="flex-grow bg-gray-900 border border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-amber-400 focus:outline-none transition disabled:opacity-50"
                        />
                        <button type="submit" disabled={isLoading || !customChoice.trim()} className="px-4 py-2 font-semibold bg-gray-700 hover:bg-gray-600 text-amber-300 rounded-md transition disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed">
                            Send
                        </button>
                    </form>
                </div>
            )}
          </footer>
        </main>
      </div>
    </div>
  );
};