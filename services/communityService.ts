import { type Post, type InspirationBlueprint, type GameSettings, type Character, User, Genre } from '../types';

const POSTS_KEY = 'gemini_adventure_posts';
const INSPIRATIONS_KEY = 'gemini_adventure_inspirations';

// --- MOCK DATA FOR FIRST-TIME USERS ---
const getInitialPosts = (): Post[] => [
    {
        id: 'p1', authorId: 'user_0', author: 'Kaelen', authorRole: 'Cursed Cartographer',
        content: "Just mapped the Whispering Woods and found a ruin not on any chart. It was humming with a strange energy. I feel like this is just the beginning...\n\nAnyone else encountered something similar? My skin is still crawling. **Definitely not going back there at night.**",
        likes: ['user_1', 'user_2'], timestamp: '3 hours ago', comments: [],
    },
    {
        id: 'p2', authorId: 'user_3', author: 'Unit 734', authorRole: 'Meme Courier',
        content: "Just delivered a meme that could crash the market. Now every corp in Neo-Kyoto wants my head. I'm currently hiding out in a noodle shop in the undercity. The things I do for creds... *sigh*.",
        likes: ['user_1'], timestamp: '8 hours ago', comments: [],
    },
];

const getInitialInspirations = (): InspirationBlueprint[] => [
     {
        id: 'i1', sharerId: 'user_4', sharer: 'Alistair',
        character: { name: 'Alistair', role: 'Vampire Sommelier', roleDescription: 'A centuries-old vampire who runs an exclusive nightclub and trades in secrets as fine as the blood he serves.' },
        settings: { genres: [Genre.URBAN_FANTASY, Genre.MYSTERY], premise: 'My most prized ghoul has been murdered, and a cryptic message left in their ashes points to a conspiracy within the city\'s supernatural underworld.' },
        likes: ['user_1', 'user_2', 'user_3'],
    },
     {
        id: 'i2', sharerId: 'user_5', sharer: 'Yuki',
        character: { name: 'Yuki', role: 'Spirit Chef', roleDescription: 'An isekai\'d chef who can cook meals that soothe and empower spirits in a magical realm.' },
        settings: { genres: [Genre.ISEKAI, Genre.FANTASY], premise: 'I was just trying to perfect my ramen recipe when I was summoned to another world to cook for a starving dragon god who has grown tired of his usual diet of terrified heroes.' },
        likes: ['user_1'],
    }
]

// --- POSTS ---

export const getPosts = (): Post[] => {
    const data = localStorage.getItem(POSTS_KEY);
    if (!data) {
        // First time load, populate with mock data
        const initialData = getInitialPosts();
        localStorage.setItem(POSTS_KEY, JSON.stringify(initialData));
        return initialData;
    }
    return JSON.parse(data);
};

export const addPost = (content: string, character: Character, user: User): Post[] => {
    const posts = getPosts();
    const newPost: Post = {
        id: `post_${Date.now()}`,
        authorId: user.id,
        author: character.name,
        authorRole: character.role,
        content,
        likes: [],
        comments: [],
        timestamp: 'Just now',
    };
    const updatedPosts = [newPost, ...posts];
    localStorage.setItem(POSTS_KEY, JSON.stringify(updatedPosts));
    return updatedPosts;
};

export const toggleLikePost = (postId: string, userId: string): Post[] => {
    const posts = getPosts();
    const updatedPosts = posts.map(p => {
        if (p.id === postId) {
            const newLikes = p.likes.includes(userId)
                ? p.likes.filter(id => id !== userId)
                : [...p.likes, userId];
            return { ...p, likes: newLikes };
        }
        return p;
    });
    localStorage.setItem(POSTS_KEY, JSON.stringify(updatedPosts));
    return updatedPosts;
};


// --- INSPIRATIONS ---

export const getInspirations = (): InspirationBlueprint[] => {
    const data = localStorage.getItem(INSPIRATIONS_KEY);
    if (!data) {
        const initialData = getInitialInspirations();
        localStorage.setItem(INSPIRATIONS_KEY, JSON.stringify(initialData));
        return initialData;
    }
    return JSON.parse(data);
};

export const addInspiration = (character: Character, settings: GameSettings, user: User): InspirationBlueprint[] => {
    const inspirations = getInspirations();
    const newInspiration: InspirationBlueprint = {
        id: `insp_${Date.now()}`,
        sharerId: user.id,
        sharer: character.name,
        character: { name: character.name, role: character.role, roleDescription: character.roleDescription },
        settings: { genres: settings.genres, premise: settings.premise },
        likes: []
    };
    const updatedInspirations = [newInspiration, ...inspirations];
    localStorage.setItem(INSPIRATIONS_KEY, JSON.stringify(updatedInspirations));
    return updatedInspirations;
};

export const toggleLikeInspiration = (inspirationId: string, userId: string): InspirationBlueprint[] => {
    const inspirations = getInspirations();
    const updatedInspirations = inspirations.map(i => {
        if (i.id === inspirationId) {
            const newLikes = i.likes.includes(userId)
                ? i.likes.filter(id => id !== userId)
                : [...i.likes, userId];
            return { ...i, likes: newLikes };
        }
        return i;
    });
    localStorage.setItem(INSPIRATIONS_KEY, JSON.stringify(updatedInspirations));
    return updatedInspirations;
};
