import React, { useState } from 'react';
import { Genre, type Character, type GameSettings, type InspirationBlueprint, type Post, type Comment } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

// --- Mock Data (for demonstration purposes) ---
const initialPosts: Post[] = [
    {
        id: 'p1',
        authorId: 'mock_user_1',
        author: 'Kaelen',
        authorRole: 'Cursed Cartographer',
        content: "Just mapped the Whispering Woods and found a ruin not on any chart. It was humming with a strange energy. I feel like this is just the beginning...\n\nAnyone else encountered something similar? My skin is still crawling. **Definitely not going back there at night.**",
        likes: ['mock_user_2', 'mock_user_3'],
        timestamp: '3 hours ago',
        comments: [
            { id: 'c1', authorId: 'mock_user_2', author: 'Lyra', content: 'Whoa, that sounds intense! Stay safe!', timestamp: '2 hours ago' },
            { id: 'c2', authorId: 'mock_user_3', author: 'Jax', content: 'Typical haunted forest behavior. Did you find any loot?', timestamp: '1 hour ago' },
        ],
    },
    {
        id: 'p2',
        authorId: 'mock_user_4',
        author: 'Unit 734',
        authorRole: 'Meme Courier',
        content: "Just delivered a meme that could crash the market. Now every corp in Neo-Kyoto wants my head. I'm currently hiding out in a noodle shop in the undercity. The things I do for creds... *sigh*.",
        likes: ['mock_user_1', 'mock_user_5'],
        timestamp: '8 hours ago',
        comments: [],
    },
];

const initialInspirations: InspirationBlueprint[] = [
    {
        id: 'i1',
        sharerId: 'mock_user_6',
        sharer: 'Alistair',
        character: { name: 'Alistair', role: 'Vampire Sommelier', roleDescription: 'A centuries-old vampire who runs an exclusive nightclub and trades in secrets as fine as the blood he serves.' },
        settings: { genres: [Genre.URBAN_FANTASY, Genre.MYSTERY], premise: 'My most prized ghoul has been murdered, and a cryptic message left in their ashes points to a conspiracy within the city\'s supernatural underworld.' },
        likes: ['mock_user_1', 'mock_user_2', 'mock_user_3'],
    },
     {
        id: 'i2',
        sharerId: 'mock_user_7',
        sharer: 'Yuki',
        character: { name: 'Yuki', role: 'Spirit Chef', roleDescription: 'An isekai\'d chef who can cook meals that soothe and empower spirits in a magical realm.' },
        settings: { genres: [Genre.ISEKAI, Genre.FANTASY], premise: 'I was just trying to perfect my ramen recipe when I was summoned to another world to cook for a starving dragon god who has grown tired of his usual diet of terrified heroes.' },
        likes: ['mock_user_4', 'mock_user_5'],
    }
];

// --- Component ---

interface CommunityPanelProps {
    character: Character | null;
    settings: GameSettings | null;
}

export const CommunityPanel: React.FC<CommunityPanelProps> = ({ character, settings }) => {
    const [activeTab, setActiveTab] = useState<'posts' | 'inspirations'>('posts');
    const [posts, setPosts] = useState(initialPosts);
    const [inspirations, setInspirations] = useState(initialInspirations);
    const [newPostContent, setNewPostContent] = useState('');

    const handleLikePost = (postId: string) => {
        setPosts(posts.map(p => p.id === postId ? { ...p, likes: [...p.likes, 'mock_user_like'] } : p));
    };
    
    const handleLikeInspiration = (inspId: string) => {
        setInspirations(inspirations.map(i => i.id === inspId ? { ...i, likes: [...i.likes, 'mock_user_like'] } : i));
    };

    const handleAddPost = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPostContent.trim() || !character) return;
        const newPost: Post = {
            id: `p${Date.now()}`,
            authorId: 'current_user_mock',
            author: character.name,
            authorRole: character.role,
            content: newPostContent,
            likes: [],
            comments: [],
            timestamp: 'Just now',
        };
        setPosts([newPost, ...posts]);
        setNewPostContent('');
    };
    
    const handleShareBlueprint = () => {
        if (!character || !settings) {
            alert("No blueprint to share!");
            return;
        }
        const newInspiration: InspirationBlueprint = {
            id: `i${Date.now()}`,
            sharerId: 'current_user_mock',
            sharer: character.name,
            character: { name: character.name, role: character.role, roleDescription: character.roleDescription },
            settings: { genres: settings.genres, premise: settings.premise },
            likes: []
        };
        setInspirations([newInspiration, ...inspirations]);
        setActiveTab('inspirations');
        alert("Your adventure blueprint has been shared!");
    };

    return (
        <div className="space-y-4 h-full flex flex-col">
            <div className="flex-shrink-0 flex border border-gray-700 rounded-lg p-1 bg-gray-900/50 space-x-1">
                 <button onClick={() => setActiveTab('posts')} className={`w-full text-center px-3 py-2 text-sm font-bold rounded-md transition-colors ${activeTab === 'posts' ? 'bg-amber-700 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Posts</button>
                 <button onClick={() => setActiveTab('inspirations')} className={`w-full text-center px-3 py-2 text-sm font-bold rounded-md transition-colors ${activeTab === 'inspirations' ? 'bg-amber-700 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Inspirations</button>
            </div>

            <div className="flex-grow overflow-y-auto space-y-4 pr-1">
                {activeTab === 'posts' && (
                    <>
                        <form onSubmit={handleAddPost} className="p-3 bg-black/20 rounded-lg border border-gray-700/50">
                            <textarea
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                                rows={3}
                                className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 text-sm focus:ring-2 focus:ring-amber-400 focus:outline-none transition"
                                placeholder={`What's happening in your adventure, ${character?.name || 'adventurer'}?`}
                            />
                             <div className="text-xs text-gray-500 mt-2">Supports: **bold**, *italic*, ~strikethrough~</div>
                            <button type="submit" className="mt-2 w-full bg-amber-600 hover:bg-amber-500 text-gray-900 font-bold py-2 px-4 rounded-md text-sm transition-colors">Post</button>
                        </form>
                        {posts.map(post => (
                            <div key={post.id} className="p-3 bg-black/20 rounded-lg border border-gray-700/50 animate-fade-in-fast">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-amber-300">{post.author}</p>
                                        <p className="text-xs text-gray-400">{post.authorRole}</p>
                                    </div>
                                    <p className="text-xs text-gray-500">{post.timestamp}</p>
                                </div>
                                <MarkdownRenderer text={post.content} className="my-3 text-gray-200 text-sm" />
                                <div className="flex items-center justify-between border-t border-gray-700 pt-2">
                                     <button onClick={() => handleLikePost(post.id)} className="flex items-center space-x-1 text-gray-400 hover:text-red-400 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                                        <span className="text-xs font-semibold">{post.likes.length}</span>
                                    </button>
                                     <div className="flex items-center space-x-1 text-gray-400">
                                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" /></svg>
                                        <span className="text-xs font-semibold">{post.comments.length}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </>
                )}

                {activeTab === 'inspirations' && (
                    <>
                       <button onClick={handleShareBlueprint} className="w-full flex items-center justify-center space-x-2 text-sm text-center bg-gray-700 hover:bg-gray-600 text-amber-300 font-bold py-3 px-4 rounded-md transition-all duration-300">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5.5 13a3.5 3.5 0 01-.369-6.98a4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H5.5z" /><path d="M9 13l-1 1v-4a1 1 0 011-1h2a1 1 0 011 1v4l-1-1-1 1-1-1z" /></svg>
                           <span>Share My Blueprint</span>
                       </button>

                        {inspirations.map(insp => (
                             <div key={insp.id} className="p-3 bg-black/20 rounded-lg border border-gray-700/50 animate-fade-in-fast">
                                 <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-amber-300">{insp.character.role}</p>
                                        <p className="text-xs text-gray-400">Shared by {insp.sharer}</p>
                                    </div>
                                    <button onClick={() => handleLikeInspiration(insp.id)} className="flex items-center space-x-1 text-gray-400 hover:text-red-400 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                                        <span className="text-xs font-semibold">{insp.likes.length}</span>
                                    </button>
                                </div>
                                <div className="my-3 text-gray-200 text-sm space-y-2 border-t border-gray-700 pt-2">
                                    <p><strong className="text-gray-400">Genres:</strong> {insp.settings.genres.join(' / ')}</p>
                                    <p><strong className="text-gray-400">Premise:</strong> {insp.settings.premise}</p>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};