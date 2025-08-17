import React, { useState, useCallback } from 'react';
import type { Chat } from '@google/genai';
import { GameSetup } from './GameSetup';
import { GameWindow } from './GameWindow';
import { GameState, type Character, type GameSettings, type StorySegment, type SaveFile, type InventoryItem, type Relationship, type Location, Gender, WritingStyle } from '../types';
import { createGameSession, sendPlayerAction, generateCharacterDetails, resumeGameSession } from '../services/geminiService';

export const GameContainer: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.SETUP);
  const [character, setCharacter] = useState<Character | null>(null);
  const [gameSettings, setGameSettings] = useState<GameSettings | null>(null);
  const [storyLog, setStoryLog] = useState<StorySegment[]>([]);
  const [currentChoices, setCurrentChoices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  
  const [recollection, setRecollection] = useState<string>('');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  const handleStartGame = useCallback(async (char: Character, settings: GameSettings) => {
    setIsLoading(true);
    setError(null);
    setStoryLog([]);
    setCurrentChoices([]);
    
    try {
      let finalChar = { ...char };
      let finalSettings = { ...settings };

      if (!finalChar.role.trim() || !finalChar.roleDescription.trim() || !finalSettings.premise.trim()) {
        const details = await generateCharacterDetails(settings.genres);
        finalChar.role = finalChar.role.trim() || details.role;
        finalChar.roleDescription = finalChar.roleDescription.trim() || details.roleDescription;
        finalSettings.premise = finalSettings.premise.trim() || details.premise;
      }
      
      setCharacter(finalChar);
      setGameSettings(finalSettings);

      const { chat, initialStory, initialChoices, initialRecollection, initialInventory, initialRelationships, initialLocations } = await createGameSession(finalChar, finalSettings);
      setChatSession(chat);
      setStoryLog([{ story: initialStory, choice: "The adventure begins..." }]);
      setCurrentChoices(initialChoices);
      setRecollection(initialRecollection);
      setInventory(initialInventory);
      setRelationships(initialRelationships);
      setLocations(initialLocations);
      setGameState(GameState.PLAYING);
    } catch (e) {
      console.error(e);
      setError('Failed to start the game. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handlePlayerChoice = useCallback(async (choice: string) => {
    if (!chatSession) {
      setError('Game session is not initialized.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    if (!gameSettings?.omnireaderMode) {
      setStoryLog(prev => [...prev, { story: '', choice: `> ${choice}` }]);
    }
    setCurrentChoices([]); // Hide choices while waiting for response

    try {
      const currentState = { recollection, inventory, relationships, locations };
      const { newStory, newChoices, updatedRecollection, updatedInventory, updatedRelationships, updatedLocations } = await sendPlayerAction(chatSession, choice, currentState);
      
      setStoryLog(prev => {
        const newLog = [...prev];
        if (gameSettings?.omnireaderMode) {
          newLog.push({ story: newStory, choice: '' });
        } else {
          const lastSegment = newLog[newLog.length-1];
          lastSegment.story = newStory;
        }
        return newLog;
      });
      
      setCurrentChoices(newChoices);
      setRecollection(updatedRecollection);
      setInventory(updatedInventory);
      setRelationships(updatedRelationships);
      setLocations(updatedLocations);

       if (newChoices.length === 0) {
        setGameState(GameState.GAME_OVER);
      }
    } catch (e) {
      console.error(e);
      setError('An error occurred while continuing the adventure. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [chatSession, recollection, inventory, relationships, locations, gameSettings]);
  
  const handleRestart = () => {
    setGameState(GameState.SETUP);
    setCharacter(null);
    setGameSettings(null);
    setStoryLog([]);
    setCurrentChoices([]);
    setChatSession(null);
    setError(null);
    setRecollection('');
    setInventory([]);
    setRelationships([]);
    setLocations([]);
  }

  const handleSaveGame = useCallback(() => {
    if (!character || !gameSettings || storyLog.length === 0) {
        alert("Cannot save the game before it has started.");
        return;
    }
    const saveData: SaveFile = {
        character,
        settings: gameSettings,
        storyLog,
        recollection,
        currentChoices,
        inventory,
        relationships,
        locations,
    };
    const blob = new Blob([JSON.stringify(saveData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${character.name.replace(/\s+/g, '_')}.rim`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [character, gameSettings, storyLog, recollection, currentChoices, inventory, relationships, locations]);

  const handleLoadGame = useCallback((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const content = event.target?.result;
              if (typeof content !== 'string') throw new Error("Invalid file content");
              
              const saveData = JSON.parse(content) as SaveFile;

              if (
                  !saveData.character || typeof saveData.character.name !== 'string' ||
                  !saveData.settings || !Array.isArray(saveData.settings.genres) ||
                  !saveData.storyLog || !Array.isArray(saveData.storyLog) ||
                  typeof saveData.recollection !== 'string' ||
                  !Array.isArray(saveData.currentChoices) ||
                  !Array.isArray(saveData.inventory) ||
                  !Array.isArray(saveData.relationships) ||
                  !Array.isArray(saveData.locations)
              ) {
                  throw new Error("Invalid save file format.");
              }

              const characterWithGender: Character = {
                  ...saveData.character,
                  gender: saveData.character.gender || Gender.NON_BINARY,
              };

              const settingsWithDefaults: GameSettings = {
                ...saveData.settings,
                writingStyle: saveData.settings.writingStyle || WritingStyle.PROSE,
                omnireaderMode: saveData.settings.omnireaderMode || false,
              };

              setError(null);
              setCharacter(characterWithGender);
              setGameSettings(settingsWithDefaults);
              
              // Per request, only load the last story segment for context.
              const lastStorySegment = saveData.storyLog[saveData.storyLog.length - 1];
              setStoryLog(lastStorySegment ? [lastStorySegment] : []);

              setRecollection(saveData.recollection);
              setCurrentChoices(saveData.currentChoices);
              setInventory(saveData.inventory);
              setRelationships(saveData.relationships);
              setLocations(saveData.locations);
              
              const chat = resumeGameSession(characterWithGender, settingsWithDefaults);
              setChatSession(chat);
              
              setGameState(saveData.currentChoices.length > 0 ? GameState.PLAYING : GameState.GAME_OVER);
          } catch (e) {
              console.error("Failed to load game:", e);
              setError("Failed to load save file. It might be corrupted or in an invalid format.");
          }
      };
      reader.readAsText(file);
  }, []);


  const renderContent = () => {
    switch (gameState) {
      case GameState.SETUP:
        return <GameSetup onStartGame={handleStartGame} onLoadGame={handleLoadGame} isLoading={isLoading} error={error} />;
      case GameState.PLAYING:
      case GameState.GAME_OVER:
        return (
          <GameWindow
            character={character}
            settings={gameSettings}
            storyLog={storyLog}
            choices={currentChoices}
            inventory={inventory}
            relationships={relationships}
            locations={locations}
            onChoiceSelected={handlePlayerChoice}
            onSaveGame={handleSaveGame}
            isLoading={isLoading}
            error={error}
            isGameOver={gameState === GameState.GAME_OVER}
            onRestart={handleRestart}
            isOmnireader={gameSettings?.omnireaderMode ?? false}
          />
        );
      default:
        return <div>Something went wrong.</div>;
    }
  };

  return <div className="w-full max-w-7xl">{renderContent()}</div>;
};