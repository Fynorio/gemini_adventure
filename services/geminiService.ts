import { GoogleGenAI, Type, type Chat } from '@google/genai';
import { Genre, type Character, type GameSettings, type PremadeIdea, type InventoryItem, type Relationship, type Location, WritingStyle } from '../types';
import { GENRES, SECRET_GENRES } from '../constants';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    story: {
      type: Type.STRING,
      description: "The next part of the story narrative. This should be descriptive, engaging, and set the scene for the player's next action. It should be at least two paragraphs long."
    },
    choices: {
      type: Type.ARRAY,
      description: "An array of 3 distinct, actionable choices for the player to make. These are suggestions; the player can also type a custom action.",
      items: { type: Type.STRING }
    },
    updated_recollection: {
      type: Type.STRING,
      description: "An updated, concise summary of all key events, characters, and plot points from the beginning of the story up to this point. Incorporate the latest events into the existing summary. This serves as the AI's long-term memory."
    },
    updated_inventory: {
        type: Type.ARRAY,
        description: "The player's complete, updated inventory list. Add, remove, or update items and quantities based on the story events of this turn.",
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "The name of the item." },
            description: { type: Type.STRING, description: "A brief description of the item." },
            quantity: { type: Type.INTEGER, description: "How many of this item the player has." }
          },
          required: ['name', 'description', 'quantity']
        }
    },
    updated_relationships: {
        type: Type.ARRAY,
        description: "A complete, updated list of NPCs and the player's relationship with them. Add new characters when they are introduced, or update the status and description of existing ones based on events.",
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "The full name of the character." },
            status: { type: Type.STRING, enum: ['Ally', 'Neutral', 'Hostile', 'Friendly', 'Romantic Interest', 'Unknown'], description: "The player's current relationship status with this character." },
            description: { type: Type.STRING, description: "A brief description of the character and the state of their relationship with the player." }
          },
          required: ['name', 'status', 'description']
        }
    },
     updated_locations: {
        type: Type.ARRAY,
        description: "A complete, updated list of significant locations the player has discovered. Add new locations only when they are first visited or become significant.",
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "The name of the location." },
            description: { type: Type.STRING, description: "A brief description of the location." }
          },
          required: ['name', 'description']
        }
    }
  },
  required: ['story', 'choices', 'updated_recollection', 'updated_inventory', 'updated_relationships', 'updated_locations']
};

const getSystemInstruction = (character: Character, settings: GameSettings): string => {
  const genreText = settings.genres.length > 1 ? `a blend of ${settings.genres.join(', ')}` : settings.genres[0];
  
  let writingStyleInstruction = `Adopt a writing style inspired by Japanese light novels. The prose should be easy to read, direct, and focus heavily on my (the protagonist's) personal experiences, thoughts, and feelings. Include my internal monologue to show my reactions to events. The tone should be engaging and immersive.`;
  if (settings.writingStyle === WritingStyle.SUMMARY) {
      writingStyleInstruction = `Adopt a concise, summary-style of writing. Focus on describing key events and advancing the plot quickly. Avoid lengthy descriptions and deep internal monologues.`;
  }
  
  let modeInstruction = '';
  if (settings.omnireaderMode) {
      modeInstruction = `\n**OMNIREADER MODE:** The player is an observer watching the story unfold. You are in control of the character's actions and decisions. You will be prompted to 'Continue'. Make compelling choices for the character and narrate the outcome. For the 'choices' array in your JSON response, provide three short phrases describing the paths you are considering, even though you will be making the final decision.`;
  }

  return `You are an expert Dungeon Master for a single-player, text-based adventure game, acting as the narrator and world.
The player's character is named ${character.name}. Their gender is ${character.gender}. Their role is '${character.role}'.
Role Description: ${character.roleDescription}.
The setting is ${genreText}.
The initial premise of the story is: ${settings.premise}. You must start the story based on this premise.${modeInstruction}

**CRITICAL WRITING RULES:**
1.  **First-Person Perspective:** ALL story narration MUST be in the first-person perspective, from my point of view (${character.name}). Use "I", "me", "my". For example: "I open the heavy oak door" instead of "You open the heavy oak door".
2.  **Writing Style:** ${writingStyleInstruction}

GAMEPLAY RULES:
1.  **JSON Output:** Your entire response MUST be a single JSON object matching the provided schema. Do not add any text before or after the JSON object. Do not use markdown.
2.  **Choices:** After describing the scene from my perspective, you MUST present me with 3 distinct, actionable choices as suggestions. If the story reaches a natural conclusion, provide a final story segment and an empty choices array.
3.  **State Management:** You are responsible for the game state. On each turn, you will receive the current state (Recollection, Inventory, Relationships, Locations) and you MUST return the COMPLETE and UPDATED state in the response.
    *   **Recollection (Memory):** In 'updated_recollection', integrate the events of the current turn into the previous summary to ensure story consistency.
    *   **Inventory:** In 'updated_inventory', reflect any items I gain, lose, or use. If an item is used up, remove it or decrease its quantity.
    *   **Relationships:** In 'updated_relationships', add new characters I meet. Update the 'status' and 'description' of existing characters based on interactions.
    *   **Locations:** In 'updated_locations', add significant new places I discover and explore.
`;
};

interface GameResponse {
  story: string;
  choices: string[];
  updated_recollection: string;
  updated_inventory: InventoryItem[];
  updated_relationships: Relationship[];
  updated_locations: Location[];
}

const parseAndValidateResponse = (text: string): GameResponse => {
  try {
    const json = JSON.parse(text);
    if (
        typeof json.story === 'string' && 
        Array.isArray(json.choices) && 
        typeof json.updated_recollection === 'string' &&
        Array.isArray(json.updated_inventory) &&
        Array.isArray(json.updated_relationships) &&
        Array.isArray(json.updated_locations)
    ) {
      return json;
    }
    throw new Error('Invalid JSON structure');
  } catch (error) {
    console.error("Failed to parse AI response:", text, error);
    throw new Error("The AI returned an invalid response. Please try again.");
  }
};

export const createGameSession = async (character: Character, settings: GameSettings) => {
  const systemInstruction = getSystemInstruction(character, settings);
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema,
      temperature: 0.9,
    }
  });

  const response = await chat.sendMessage({ message: "Start the adventure." });
  const parsedResponse = parseAndValidateResponse(response.text);

  return {
    chat,
    initialStory: parsedResponse.story,
    initialChoices: parsedResponse.choices,
    initialRecollection: parsedResponse.updated_recollection,
    initialInventory: parsedResponse.updated_inventory,
    initialRelationships: parsedResponse.updated_relationships,
    initialLocations: parsedResponse.updated_locations,
  };
};

export const resumeGameSession = (character: Character, settings: GameSettings): Chat => {
  const systemInstruction = getSystemInstruction(character, settings);
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema,
      temperature: 0.9,
    }
  });
  return chat;
};

interface GameStatePayload {
    recollection: string;
    inventory: InventoryItem[];
    relationships: Relationship[];
    locations: Location[];
}

export const sendPlayerAction = async (chat: Chat, action: string, currentState: GameStatePayload) => {
  const message = `Here is the current game state:
- Recollection (Story Summary): ${currentState.recollection || "The story is just beginning."}
- Inventory: ${JSON.stringify(currentState.inventory) || "Empty"}
- Relationships: ${JSON.stringify(currentState.relationships) || "None"}
- Discovered Locations: ${JSON.stringify(currentState.locations) || "None"}

My action is: "${action}"`;
  
  const response = await chat.sendMessage({ message });
  const parsedResponse = parseAndValidateResponse(response.text);
  
  return {
    newStory: parsedResponse.story,
    newChoices: parsedResponse.choices,
    updatedRecollection: parsedResponse.updated_recollection,
    updatedInventory: parsedResponse.updated_inventory,
    updatedRelationships: parsedResponse.updated_relationships,
    updatedLocations: parsedResponse.updated_locations,
  };
};

export const generatePremadeIdeas = async (): Promise<PremadeIdea[]> => {
  const allGenres = [...GENRES, ...SECRET_GENRES];
  const premadeIdeasSchema = {
    type: Type.OBJECT,
    properties: {
      ideas: {
        type: Type.ARRAY,
        description: "An array of 3 unique and creative adventure ideas.",
        items: {
          type: Type.OBJECT,
          properties: {
            genre: {
              type: Type.STRING,
              description: "The genre of the adventure.",
              enum: allGenres,
            },
            role: {
              type: Type.STRING,
              description: "A compelling, one-or-two-word character role or archetype.",
            },
            roleDescription: {
              type: Type.STRING,
              description: "A brief, one-sentence description of the character.",
            },
            premise: {
              type: Type.STRING,
              description: "A concise, one-or-two-sentence story premise that sets up an interesting starting scenario.",
            }
          },
          required: ['genre', 'role', 'roleDescription', 'premise']
        }
      }
    },
    required: ['ideas']
  };

  const prompt = `Generate 3 unique and creative story ideas for a text-based adventure game. Each idea must include a genre from the provided list, a character role, a short character description, and a compelling story premise. Ensure the ideas are distinct from each other.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: premadeIdeasSchema,
        temperature: 1.0,
      },
    });

    const json = JSON.parse(response.text);
    if (json.ideas && Array.isArray(json.ideas) && json.ideas.length > 0) {
       return json.ideas.slice(0, 3).map((idea: any) => ({ ...idea, genre: idea.genre as Genre }));
    }
    throw new Error('Invalid JSON structure for premade ideas');

  } catch (error) {
    console.error("Failed to generate premade ideas:", error);
    // Fallback to a hardcoded list in case of API error
    return [
        { genre: Genre.FANTASY, role: "Cursed Cartographer", roleDescription: "A mapmaker whose charts reveal truths others wish to keep hidden.", premise: "I've been hired to map a haunted forest, but my latest chart reveals a forgotten ruin that isn't on any other map." },
        { genre: Genre.CYBERPUNK, role: "Meme Courier", roleDescription: "A data runner who traffics in dangerous, mind-altering viral ideas.", premise: "I've intercepted a data-packet containing a meme that can crash markets. Now, every corporation in the city is after me." },
        { genre: Genre.URBAN_FANTASY, role: "Hex-Slinger", roleDescription: "A gunslinger who carves magical runes onto their bullets.", premise: "A spectral locomotive has been terrorizing the frontier, and the railroad baron has hired me to put it to rest for good." },
    ];
  }
};

export const generateCharacterDetails = async (genres: Genre[]): Promise<{ role: string, roleDescription: string, premise: string }> => {
  const detailsSchema = {
    type: Type.OBJECT,
    properties: {
      role: {
        type: Type.STRING,
        description: "A compelling, one-or-two-word character role or archetype.",
      },
      roleDescription: {
        type: Type.STRING,
        description: "A brief, one-sentence description of the character.",
      },
      premise: {
        type: Type.STRING,
        description: "A concise, one-or-two-sentence story premise that sets up an interesting starting scenario from a first-person perspective.",
      }
    },
    required: ['role', 'roleDescription', 'premise']
  };

  const genreText = genres.length > 1 ? `a blend of ${genres.join(', ')}` : genres[0];
  const prompt = `Generate a character role, a one-sentence role description, and a one-sentence story premise for a text-based adventure game in the '${genreText}' genre. The result should be creative and provide a good starting point for a story. The premise MUST be from a first-person perspective.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: detailsSchema,
        temperature: 1.0,
      },
    });

    const json = JSON.parse(response.text);
    if (json.role && json.roleDescription && json.premise) {
       return json;
    }
    throw new Error('Invalid JSON structure for character details');

  } catch (error) {
    console.error("Failed to generate character details:", error);
    // Fallback to a hardcoded value
    return {
        role: "Wanderer",
        roleDescription: "A traveler with a mysterious past and an uncertain future.",
        premise: "I arrive in a new town with nothing but the clothes on my back, looking for work, but I find a conspiracy instead."
    };
  }
};
