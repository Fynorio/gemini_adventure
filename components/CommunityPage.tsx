import React, { useState, useEffect, useContext } from 'react';
import { type Character, type GameSettings, type InspirationBlueprint, type Post } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { AuthContext } from '../contexts/AuthContext';
import * as communityService from '../services/communityService';
import { LoadingSpinner } from './icons/LoadingSpinner';

export const CommunityPage: React.FC = () => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState<'posts' | 'inspirations'>('posts');
    const [posts, setPosts] = useState<Post[]>([]);
    const [inspirations, setInspirations] = useState<InspirationBlueprint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newPostContent, setNewPostContent] = useState('');
    
    // This is a stand-in. In a real app, you'd fetch the user's current character.
    // For now, we'll create a mock character for posting.
    const mockCharacter: Character = {
        name: user?.email.split('@')[0] || 'Wanderer',
        role: 'Adventurer',
        gender: 'Non-Binary' as any,
        roleDescription: 'A traveler of the digital realms.'
    };

    useEffect(() => {
        setIsLoading(true);
        setPosts(communityService.getPosts());
        setInspirations(communityService.getInspirations());
        setIsLoading(false);
    }, []);

    const handleLikePost = (postId: string) => {
        if (!user) return;
        setPosts(communityService.toggleLikePost(postId, user.id));
    };
    
    const handleLikeInspiration = (inspId: string) => {
        if (!user) return;
        setInspirations(communityService.toggleLikeInspiration(inspId, user.id));
    };

    const handleAddPost = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPostContent.trim() || !user) return;
        const updatedPosts = communityService.addPost(newPostContent, mockCharacter, user);
        setPosts(updatedPosts);
        setNewPostContent('');
    };

    if (isLoading || !user) {
        return <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>;
    }

    return (
        <div className="w-full max-w-3xl h-full flex flex-col p-4">
            <h1 className="text-3xl font-serif-display text-center text-amber-300 mb-6">Community Hub</h1>
            <div className="flex-shrink-0 flex border border-gray-700 rounded-lg p-1 bg-gray-900/50 space-x-1 mb-4">
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
                                placeholder={`What's happening in your adventure, ${mockCharacter.name}?`}
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
                                     <button onClick={() => handleLikePost(post.id)} className={`flex items-center space-x-1 transition-colors ${post.likes.includes(user.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}>
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
                       {/* This button would need access to the current game's blueprint */}
                       <div className="p-3 bg-black/20 rounded-lg border border-gray-700/50 text-center text-sm text-gray-400">
                          To share your adventure's blueprint, start a game and use the 'Share Blueprint' option in the game window.
                       </div>

                        {inspirations.map(insp => (
                             <div key={insp.id} className="p-3 bg-black/20 rounded-lg border border-gray-700/50 animate-fade-in-fast">
                                 <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-amber-300">{insp.character.role}</p>
                                        <p className="text-xs text-gray-400">Shared by {insp.sharer}</p>
                                    </div>
                                    <button onClick={() => handleLikeInspiration(insp.id)} className={`flex items-center space-x-1 transition-colors ${insp.likes.includes(user.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}>
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
