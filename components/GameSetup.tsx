import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Character, GameSettings, PremadeIdea } from '../types';
import { Genre, Gender, WritingStyle } from '../types';
import { GENRES, SECRET_GENRES, GENRE_DESCRIPTIONS, GENRE_CONFLICTS } from '../constants';
import { LoadingSpinner } from './icons/LoadingSpinner';
import { generatePremadeIdeas } from '../services/geminiService';

interface GameSetupProps {
  onStartGame: (character: Character, settings: GameSettings) => void;
  onLoadGame: (file: File) => void;
  isLoading: boolean;
  error: string | null;
}

const GenreTag: React.FC<{
  genre: Genre,
  isSelected: boolean,
  isDisabled: boolean,
  onClick: (genre: Genre) => void,
}> = ({ genre, isSelected, isDisabled, onClick }) => {
  let baseClasses = "px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-all duration-200 cursor-pointer text-center";
  let stateClasses = "";
  if (isSelected) {
    stateClasses = "bg-amber-600 border-amber-400 text-white shadow-lg";
  } else if (isDisabled) {
    stateClasses = "bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed opacity-60";
  } else {
    stateClasses = "bg-gray-900 border-gray-600 hover:border-amber-500 hover:text-amber-300";
  }
  
  const title = isDisabled && !isSelected ? `Conflicts with a selected genre.` : GENRE_DESCRIPTIONS[genre];

  return (
    <button
      type="button"
      className={`${baseClasses} ${stateClasses}`}
      onClick={() => !isDisabled && onClick(genre)}
      disabled={isDisabled}
      title={title}
    >
      {genre}
    </button>
  );
};

const SegmentedControlButton: React.FC<{
    label: string;
    isSelected: boolean;
    onClick: () => void;
    position?: 'first' | 'last' | 'middle' | 'single';
}> = ({ label, isSelected, onClick, position = 'single' }) => {
    const roundedClasses = {
        first: 'rounded-l-lg',
        last: 'rounded-r-lg',
        middle: '',
        single: 'rounded-lg',
    };
    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full text-center px-4 py-2 text-sm font-semibold border-y-2 border-r-2 first:border-l-2 transition-all duration-200 -ml-px first:ml-0 focus:relative focus:z-10 ${roundedClasses[position]} ${
                isSelected
                    ? 'bg-amber-600 border-amber-400 text-white shadow-lg z-10'
                    : 'bg-gray-900 border-gray-600 hover:bg-gray-700'
            }`}
        >
            {label}
        </button>
    );
};

const ToggleSwitch: React.FC<{
    label: string;
    enabled: boolean;
    setEnabled: (enabled: boolean) => void;
}> = ({ label, enabled, setEnabled }) => {
    return (
        <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-300">{label}</span>
            <button
                type="button"
                role="switch"
                aria-checked={enabled}
                onClick={() => setEnabled(!enabled)}
                className={`${
                    enabled ? 'bg-amber-600' : 'bg-gray-700'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-gray-900`}
            >
                <span
                    className={`${
                        enabled ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
            </button>
        </div>
    );
};


export const GameSetup: React.FC<GameSetupProps> = ({ onStartGame, onLoadGame, isLoading, error }) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>(Gender.MALE);
  const [selectedGenres, setSelectedGenres] = useState<Genre[]>([]);
  const [role, setRole] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [premise, setPremise] = useState('');
  const [writingStyle, setWritingStyle] = useState<WritingStyle>(WritingStyle.PROSE);
  const [omnireaderMode, setOmnireaderMode] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [premadeIdeas, setPremadeIdeas] = useState<PremadeIdea[]>([]);
  const [isIdeasLoading, setIsIdeasLoading] = useState(true);

  const [secretMode, setSecretMode] = useState(false);
  const [titleClicks, setTitleClicks] = useState(0);

  const fetchIdeas = useCallback(async () => {
    setIsIdeasLoading(true);
    const ideas = await generatePremadeIdeas();
    setPremadeIdeas(ideas);
    setIsIdeasLoading(false);
  }, []);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  const handleApplyIdea = (idea: PremadeIdea) => {
    if (SECRET_GENRES.includes(idea.genre) && !secretMode) {
      setSecretMode(true);
    }
    setSelectedGenres([idea.genre]);
    setRole(idea.role);
    setRoleDescription(idea.roleDescription);
    setPremise(idea.premise);
    setShowDetails(true);
  };

  const handleTitleClick = () => {
    const newClickCount = titleClicks + 1;
    setTitleClicks(newClickCount);
    if (newClickCount >= 5 && !secretMode) {
      setSecretMode(true);
    }
  };

  const handleGenreClick = (genre: Genre) => {
    setSelectedGenres(prev => {
      if (prev.includes(genre)) {
        return prev.filter(g => g !== genre);
      }
      if (prev.length < 3) {
        return [...prev, genre];
      }
      return prev;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && selectedGenres.length > 0 && !isLoading) {
      onStartGame(
        { name: name.trim(), gender, role: role.trim(), roleDescription: roleDescription.trim() },
        { genres: selectedGenres, premise: premise.trim(), writingStyle, omnireaderMode }
      );
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onLoadGame(file);
    }
  };
  
  const displayedGenres = useMemo(() => 
    secretMode ? [...GENRES, ...SECRET_GENRES].sort() : GENRES
  , [secretMode]);
  
  const conflictingGenres = useMemo(() => {
    const conflicts = new Set<Genre>();
    selectedGenres.forEach(g => {
        (GENRE_CONFLICTS[g] || []).forEach(conflict => conflicts.add(conflict));
    });
    return conflicts;
  }, [selectedGenres]);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-8 shadow-2xl max-w-3xl mx-auto animate-fade-in">
      <h1 
        className={`text-4xl font-serif-display text-center text-amber-300 mb-2 cursor-pointer transition-all duration-500 ${secretMode ? 'text-purple-400 animate-pulse' : ''}`}
        onClick={handleTitleClick}
        title={secretMode ? "Secret Mode Activated" : "Click me..."}
      >
        Gemini Adventure
      </h1>
      <p className="text-center text-gray-400 mb-8">Craft your character and story, or choose an idea from the board to begin.</p>
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-200">Inspiration Board</h2>
          <button onClick={fetchIdeas} disabled={isIdeasLoading} className="flex items-center space-x-2 text-sm text-amber-400 hover:text-amber-300 disabled:text-gray-500 disabled:cursor-wait transition">
            {isIdeasLoading ? <LoadingSpinner/> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5m20 20v-5h-5m-4.5 2.5a9 9 0 115.3-8.3" /></svg>}
            <span>Refresh Ideas</span>
          </button>
        </div>
        {isIdeasLoading ? (
          <div className="grid md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-44 bg-gray-700/50 rounded-lg animate-pulse"></div>)}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {premadeIdeas.map((idea, index) => (
              <button key={index} onClick={() => handleApplyIdea(idea)} className="text-left p-4 bg-gray-900/70 border border-gray-700 rounded-lg hover:bg-amber-900/50 hover:border-amber-600 transition-all duration-200 cursor-pointer flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase text-amber-400 tracking-wider">{idea.genre}</span>
                  <h3 className="font-bold text-gray-100 mt-1">{idea.role}</h3>
                  <p className="text-sm text-gray-400 mt-2">{idea.premise}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border-t border-gray-700 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">My Name</label>
                  <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-amber-400 focus:outline-none transition" placeholder="e.g., Kaelen" required />
              </div>
              <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-300 mb-2">My Gender</label>
                  <div className="flex">
                      <SegmentedControlButton label="Male" isSelected={gender === Gender.MALE} onClick={() => setGender(Gender.MALE)} position="first" />
                      <SegmentedControlButton label="Female" isSelected={gender === Gender.FEMALE} onClick={() => setGender(Gender.FEMALE)} position="middle" />
                      <SegmentedControlButton label="Non-Binary" isSelected={gender === Gender.NON_BINARY} onClick={() => setGender(Gender.NON_BINARY)} position="last" />
                  </div>
              </div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-baseline mb-2">
            <label className="block text-sm font-medium text-gray-300">Choose up to 3 Genres</label>
            <span className="text-xs text-gray-400">{selectedGenres.length} / 3 selected</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-3 bg-black/20 rounded-md">
            {displayedGenres.map(g => {
              const isSelected = selectedGenres.includes(g);
              const isAtMax = selectedGenres.length >= 3 && !isSelected;
              const isConflictingWithSelection = conflictingGenres.has(g);
              const isDisabled = isAtMax || isConflictingWithSelection;

              return <GenreTag key={g} genre={g} isSelected={isSelected} isDisabled={isDisabled} onClick={handleGenreClick} />
            })}
          </div>
          {selectedGenres.length > 0 && (
              <div className="text-sm text-gray-400 mt-2 p-3 bg-black/20 rounded-md space-y-2">
                {selectedGenres.map(g => (
                    <div key={g}>
                        <p className="font-bold text-amber-400">{g}</p>
                        <p className="text-gray-300">{GENRE_DESCRIPTIONS[g]}</p>
                    </div>
                ))}
              </div>
          )}
        </div>
        
        <div className="border-t border-gray-700 pt-6">
            <h3 className="text-base font-medium text-gray-300 mb-4">Game Style</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Writing Style</label>
                    <div className="flex">
                        <SegmentedControlButton label="Prose" isSelected={writingStyle === WritingStyle.PROSE} onClick={() => setWritingStyle(WritingStyle.PROSE)} position="first" />
                        <SegmentedControlButton label="Summary" isSelected={writingStyle === WritingStyle.SUMMARY} onClick={() => setWritingStyle(WritingStyle.SUMMARY)} position="last" />
                    </div>
                    <p className="text-xs text-gray-400 mt-2 h-10">
                        {writingStyle === WritingStyle.PROSE 
                            ? "Descriptive, novel-like writing with detailed scenes and character thoughts."
                            : "Concise, fast-paced writing that focuses on key events and plot progression."}
                    </p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Reading Mode</label>
                    <div className="p-3 bg-black/20 rounded-md">
                        <ToggleSwitch label="Omnireader Mode" enabled={omnireaderMode} setEnabled={setOmnireaderMode} />
                    </div>
                    <p className="text-xs text-gray-400 mt-2 h-10">
                        Sit back and watch the story unfold. The AI will make choices and advance the story automatically.
                    </p>
                </div>
            </div>
        </div>

        <div>
            <button type="button" onClick={() => setShowDetails(!showDetails)} className="w-full flex justify-between items-center text-left text-sm font-medium text-gray-300 p-2 rounded-md hover:bg-gray-700/50">
                <span>Story Details (Optional - Leave blank for a surprise)</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 transition-transform ${showDetails ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {showDetails && (
                <div className="space-y-6 mt-2 p-4 bg-black/20 rounded-md border border-gray-700/50 animate-fade-in-fast">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-2">My Role</label>
                            <input id="role" type="text" value={role} onChange={(e) => setRole(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-amber-400 focus:outline-none transition" placeholder="e.g., Cursed Cartographer" />
                        </div>
                        <div>
                            <label htmlFor="roleDescription" className="block text-sm font-medium text-gray-300 mb-2">Role Description</label>
                            <input id="roleDescription" value={roleDescription} onChange={(e) => setRoleDescription(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-amber-400 focus:outline-none transition" placeholder="e.g., A mapmaker whose charts reveal truths..." />
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="premise" className="block text-sm font-medium text-gray-300 mb-2">Story Premise</label>
                        <textarea id="premise" value={premise} onChange={(e) => setPremise(e.target.value)} rows={3} className="w-full bg-gray-900 border border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-amber-400 focus:outline-none transition" placeholder="e.g., Hired to map a haunted forest, I find a forgotten ruin..." />
                    </div>
                </div>
            )}
        </div>
        
        {error && <p className="text-red-400 text-center bg-red-900/50 p-3 rounded-md">{error}</p>}

        <div className="pt-6 border-t border-gray-700">
          <button
            type="submit"
            disabled={isLoading || !name.trim() || selectedGenres.length === 0}
            className="w-full bg-amber-600 hover:bg-amber-500 text-gray-900 font-bold py-3 px-4 rounded-md transition-all duration-300 flex items-center justify-center disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {isLoading ? <LoadingSpinner /> : 'Start Adventure'}
          </button>

          <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-600"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-sm">Or</span>
              <div className="flex-grow border-t border-gray-600"></div>
          </div>

          <div>
              <label htmlFor="load-game-input" className="w-full text-center cursor-pointer bg-gray-700 hover:bg-gray-600 text-amber-300 font-bold py-3 px-4 rounded-md transition-all duration-300 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  Load Adventure (.rim file)
              </label>
              <input id="load-game-input" type="file" accept=".rim" className="hidden" onChange={handleFileSelect} />
          </div>
        </div>
      </form>
    </div>
  );
};