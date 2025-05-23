import React from 'react';
import { X } from 'lucide-react';

const PetModal = ({ isOpen, onClose, onEggClick }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
      <div className="bg-zinc-900 p-8 rounded-2xl shadow-xl w-11/12 max-w-md relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Modal Content */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-8">Your Pet Egg</h2>
          
          {/* Egg Container with Pointers */}
          <div className="relative flex justify-center items-center mb-8">
            {/* Left Pointer */}
            <div className="absolute left-8 text-green-400 animate-bounce">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Click me!</span>
                <div className="w-0 h-0 border-l-8 border-l-green-400 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
              </div>
            </div>

            {/* Right Pointer */}
            <div className="absolute right-8 text-green-400 animate-bounce delay-300">
              <div className="flex items-center gap-2">
                <div className="w-0 h-0 border-r-8 border-r-green-400 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                <span className="text-sm font-medium">Hatch me!</span>
              </div>
            </div>

            {/* The Egg */}
            <button
              onClick={onEggClick}
              className="w-32 h-40 bg-gradient-to-b from-gray-200 via-gray-100 to-gray-300 rounded-silver-egg border border-gray-400 shadow-inner animate-silver-glow hover:scale-110 transition-transform duration-200 cursor-pointer"
            >
            </button>
          </div>

          <p className="text-gray-300 text-sm mb-4">
            Click your egg to help it hatch! Keep studying to give it energy.
          </p>
          
          <div className="text-xs text-gray-500">
            Premium Feature ✨
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetModal;