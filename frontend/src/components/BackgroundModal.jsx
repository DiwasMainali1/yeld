import React from 'react';
import { X, Image } from 'lucide-react';

// Import background images
import cafeBackground from '../backgrounds/cafe.jpg';
import fireplaceBackground from '../backgrounds/fireplace.jpg';
import forestBackground from '../backgrounds/forest.jpg';
import galaxyBackground from '../backgrounds/galaxy.jpg';
import ghibliBackground from '../backgrounds/ghibli.jpg';
import midnightBackground from '../backgrounds/midnight.jpg';
import oceanBackground from '../backgrounds/ocean.jpg';
import spiritedBackground from '../backgrounds/spirited.jpg';
import sunsetBackground from '../backgrounds/sunset.jpg';

const BackgroundModal = ({ isOpen, onClose, onSelect, currentBackground }) => {
  if (!isOpen) return null;

  const backgrounds = [
    { id: 'default', name: 'Default', color: 'bg-black' },
    { id: 'cafe', name: 'Cafe', image: cafeBackground },
    { id: 'fireplace', name: 'Fireplace', image: fireplaceBackground },
    { id: 'forest', name: 'Forest', image: forestBackground },
    { id: 'galaxy', name: 'Galaxy', image: galaxyBackground },
    { id: 'ghibli', name: 'Ghibli', image: ghibliBackground },
    { id: 'midnight', name: 'Midnight', image: midnightBackground },
    { id: 'ocean', name: 'Ocean', image: oceanBackground },
    { id: 'spirited', name: 'Spirited Away', image: spiritedBackground },
    { id: 'sunset', name: 'Sunset', image: sunsetBackground }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-950 rounded-2xl border border-zinc-800 shadow-xl w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Select Background</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-6">
          {backgrounds.map((bg) => (
            <button
              key={bg.id}
              onClick={() => onSelect(bg.id)}
              className={`h-24 w-full rounded-lg overflow-hidden transition-transform hover:scale-105 hover:shadow-lg ${
                currentBackground === bg.id ? 'ring-2 ring-offset-2 ring-offset-zinc-950 ring-white' : ''
              }`}
            >
              {bg.id === 'default' ? (
                <div className="w-full h-full flex items-center justify-center bg-black">
                  <span className="text-white text-sm font-medium text-center px-2">
                    {bg.name}
                  </span>
                </div>
              ) : (
                <div className="w-full h-full relative">
                  <img 
                    src={bg.image} 
                    alt={bg.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white text-sm font-medium text-center px-2">
                      {bg.name}
                    </span>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackgroundModal;