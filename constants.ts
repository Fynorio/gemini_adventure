import { Genre } from './types';

export const GENRES = [
  Genre.FANTASY,
  Genre.SCI_FI,
  Genre.CYBERPUNK,
  Genre.HORROR,
  Genre.MYSTERY,
  Genre.WESTERN,
  Genre.POST_APOCALYPTIC,
  Genre.SUPERHERO,
  Genre.ROMANCE,
  Genre.ROMCOM,
  Genre.ISEKAI,
  Genre.LITRPG,
  Genre.CULTIVATION,
  Genre.URBAN_FANTASY,
].sort();

export const SECRET_GENRES = [
    Genre.DARK_FANTASY,
    Genre.HAREM,
    Genre.ACADEMY_ROMANCE,
    Genre.ECCHI,
].sort();

export const GENRE_DESCRIPTIONS: Record<Genre, string> = {
  [Genre.FANTASY]: "Embark on a quest in a world of dragons, magic, and ancient kingdoms.",
  [Genre.SCI_FI]: "Explore distant galaxies, encounter alien life, and command advanced technology.",
  [Genre.CYBERPUNK]: "Navigate the neon-drenched streets of a high-tech, low-life future.",
  [Genre.HORROR]: "Confront unimaginable terrors and struggle to maintain your sanity against the unknown.",
  [Genre.MYSTERY]: "Solve complex cases in a city of shadows, where everyone has a secret.",
  [Genre.WESTERN]: "Face down outlaws and supernatural horrors on the haunted frontier.",
  [Genre.POST_APOCALYPTIC]: "Survive in a ruined world, scavenging for resources and fighting for your life.",
  [Genre.SUPERHERO]: "Battle corruption as a powered individual in a city that's lost its heroes.",
  [Genre.ROMANCE]: "Navigate complex relationships, experience heartfelt moments, and maybe find true love.",
  [Genre.ROMCOM]: "A lighthearted adventure of love, laughter, and awkward situations. Expect witty banter and comedic misunderstandings.",
  [Genre.ISEKAI]: "Suddenly transported to another world, you must learn to survive and find your purpose with strange new powers or knowledge.",
  [Genre.LITRPG]: "Live in a world governed by game mechanics. Level up, gain skills, and view the world through a status screen.",
  [Genre.CULTIVATION]: "Embark on a journey of spiritual and martial growth to attain immense power or even immortality.",
  [Genre.URBAN_FANTASY]: "Magic, myths, and monsters are real, hiding just beneath the surface of our modern-day world.",
  // Secret Descriptions
  [Genre.DARK_FANTASY]: "Explore a gritty, morally ambiguous world where heroes are flawed and victory comes at a great cost. Mature themes.",
  [Genre.HAREM]: "A comedic, trope-filled adventure where multiple charismatic individuals find themselves vying for your attention.",
  [Genre.ACADEMY_ROMANCE]: "Navigate the intricate social hierarchies, magical curriculum, and burgeoning romances within the walls of a prestigious academy.",
  [Genre.ECCHI]: "A genre focusing on suggestive humor, innuendo, and lighthearted, risqué scenarios. Not explicit, but cheeky.",
};

// --- GENRE CONFLICTS ---
// To prevent tonally dissonant stories, some genres cannot be mixed.
const GRIM_TONES = [Genre.HORROR, Genre.DARK_FANTASY, Genre.CYBERPUNK, Genre.SUPERHERO, Genre.MYSTERY];
const LIGHT_TONES = [Genre.ROMCOM, Genre.HAREM, Genre.ECCHI];

const conflicts: Record<string, Genre[]> = {};

// Function to create symmetrical conflicts
const addConflict = (genreA: Genre, genreB: Genre) => {
    if (!conflicts[genreA]) conflicts[genreA] = [];
    if (!conflicts[genreB]) conflicts[genreB] = [];
    conflicts[genreA].push(genreB);
    conflicts[genreB].push(genreA);
};

// Light and Grim tones conflict with each other
for (const light of LIGHT_TONES) {
    for (const grim of GRIM_TONES) {
        addConflict(light, grim);
    }
}

// Specific thematic conflicts
addConflict(Genre.ROMANCE, Genre.HAREM); // Focus on one vs focus on many
addConflict(Genre.ROMANCE, Genre.ECCHI); // Keep romance more grounded

export const GENRE_CONFLICTS: Record<Genre, Genre[]> = conflicts as Record<Genre, Genre[]>;
