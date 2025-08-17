import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

interface NavbarProps {
    navigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ navigate }) => {
    const { user, logout } = useContext(AuthContext);

    return (
        <nav className="w-full bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 p-4 flex justify-between items-center flex-shrink-0">
            <div className="flex items-center space-x-8">
                <a href="/#" onClick={(e) => { e.preventDefault(); navigate('#/game') }} className="text-xl font-serif-display text-amber-300">Gemini Adventure</a>
                {user && (
                    <div className="hidden md:flex items-center space-x-4">
                        <a href="/#" onClick={(e) => { e.preventDefault(); navigate('#/game') }} className="text-sm font-semibold text-gray-300 hover:text-amber-300 transition">New Game</a>
                        <a href="/#/community" onClick={(e) => { e.preventDefault(); navigate('#/community') }} className="text-sm font-semibold text-gray-300 hover:text-amber-300 transition">Community</a>
                    </div>
                )}
            </div>
            <div className="flex items-center space-x-3">
                {user ? (
                    <>
                        <span className="text-sm text-gray-400 hidden sm:inline">{user.email}</span>
                        <button onClick={logout} className="px-4 py-2 text-sm font-semibold bg-gray-700 hover:bg-gray-600 text-amber-300 rounded-md transition">Logout</button>
                    </>
                ) : (
                    <>
                        <button onClick={() => navigate('#/login')} className="px-4 py-2 text-sm font-semibold bg-gray-700 hover:bg-gray-600 text-amber-300 rounded-md transition">Login</button>
                        <button onClick={() => navigate('#/register')} className="px-4 py-2 text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-gray-900 rounded-md transition">Sign Up</button>
                    </>
                )}
            </div>
        </nav>
    );
};
