
import React from 'react';
import { FilmIcon } from './Icons';

const Header: React.FC = () => {
  return (
    <header className="py-4 border-b border-gray-700/50">
      <div className="container mx-auto px-4 flex items-center justify-center text-center">
        <FilmIcon className="h-8 w-8 mr-3 text-purple-400" />
        <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-indigo-400 text-transparent bg-clip-text">
            AI Video Clipper
            </h1>
            <p className="text-sm text-gray-400 hidden sm:block">Turn long videos into viral shorts, powered by Gemini.</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
