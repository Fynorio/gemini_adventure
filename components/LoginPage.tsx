import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { LoadingSpinner } from './icons/LoadingSpinner';

interface LoginPageProps {
    navigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ navigate }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await login(email, password);
            navigate('#/game');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-8 shadow-2xl max-w-md w-full mx-auto animate-fade-in">
            <h1 className="text-3xl font-serif-display text-center text-amber-300 mb-2">Welcome Back</h1>
            <p className="text-center text-gray-400 mb-8">Log in to continue your adventure.</p>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-amber-400 focus:outline-none transition"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-amber-400 focus:outline-none transition"
                        required
                    />
                </div>
                
                {error && <p className="text-red-400 text-center bg-red-900/50 p-3 rounded-md">{error}</p>}
                
                <div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-amber-600 hover:bg-amber-500 text-gray-900 font-bold py-3 px-4 rounded-md transition-all duration-300 flex items-center justify-center disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <LoadingSpinner /> : 'Login'}
                    </button>
                </div>
                 <p className="text-center text-sm text-gray-400">
                    Don't have an account?{' '}
                    <a href="#/register" onClick={(e) => { e.preventDefault(); navigate('#/register'); }} className="font-semibold text-amber-400 hover:text-amber-300">
                        Sign Up
                    </a>
                </p>
            </form>
        </div>
    );
};