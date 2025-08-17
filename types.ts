export enum GameState {
  SETUP,
  PLAYING,
  GAME_OVER,
}

export enum Gender {
  MALE = "Male",
  FEMALE = "Female",
  NON_BINARY = "Non-Binary",
}

export enum WritingStyle {
  PROSE = "Prose",
  SUMMARY = "Summary",
}

export interface Character {
  name: string;
  gender: Gender;
  role: string;
  roleDescription: string;
}

export enum Genre {
  FANTASY = "High Fantasy",
  SCI_FI = "Science Fiction",
  HORROR = "Cosmic Horror",
  CYBERPUNK = "Cyberpunk Dystopia",
  MYSTERY = "Noir Mystery",
  WESTERN = "Weird West",
  POST_APOCALYPTIC = "Post-Apocalyptic Survival",
  SUPERHERO = "Superhero Noir",
  ROMANCE = "Romance",
  ROMCOM = "Romantic Comedy",
  ISEKAI = "Isekai",
  LITRPG = "LitRPG / GameLit",
  CULTIVATION = "Cultivation / Xianxia",
  URBAN_FANTASY = "Urban Fantasy",
  // Secret Genres
  DARK_FANTASY = "Dark Fantasy",
  HAREM = "Harem Comedy",
  ACADEMY_ROMANCE = "Magical Academy",
  ECCHI = "Ecchi",
}

export interface GameSettings {
  genres: Genre[];
  premise: string;
  writingStyle: WritingStyle;
  omnireaderMode: boolean;
}

export interface StorySegment {
  story: string;
  choice: string;
}

export interface PremadeIdea {
  genre: Genre;
  role: string;
  roleDescription:string;
  premise: string;
}

// --- Community & User Types ---

export interface User {
  id: string;
  email: string;
}

export interface Comment {
  id: string;
  authorId: string;
  author: string;
  content: string;
  timestamp: string;
}

export interface Post {
  id: string;
  authorId: string;
  author: string;
  authorRole: string;
  content: string;
  likes: string[]; // Array of user IDs
  timestamp: string;
  comments: Comment[];
}

export interface InspirationBlueprint {
  id:string;
  sharerId: string;
  sharer: string; // The name of the user who shared it
  character: {
    name: string;
    role: string;
    roleDescription: string;
  };
  settings: {
    genres: Genre[];
    premise: string;
  };
  likes: string[]; // Array of user IDs
}


// --- Game State Types ---

export interface InventoryItem {
  name: string;
  description: string;
  quantity: number;
}

export interface Relationship {
  name: string;
  status: 'Ally' | 'Neutral' | 'Hostile' | 'Friendly' | 'Romantic Interest' | 'Unknown';
  description: string;
}

export interface Location {
  name: string;
  description: string;
}

export interface SaveFile {
  character: Character;
  settings: GameSettings;
  storyLog: StorySegment[];
  recollection: string;
  currentChoices: string[];
  inventory: InventoryItem[];
  relationships: Relationship[];
  locations: Location[];
}
