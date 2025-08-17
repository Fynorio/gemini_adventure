import React from 'react';
import { GameContainer } from './components/GameContainer';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center p-4 sm:p-8">
       <GameContainer />
    </div>
  );
};

export default App;