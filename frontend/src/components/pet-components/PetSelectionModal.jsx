import React from 'react';
import { X } from 'lucide-react';

function PetSelectionModal({ isOpen, onClose, unlockedPets, activePet, onSelectPet, birdAssets }) {
    if (!isOpen) return null;

    const getPetDisplayName = (petId) => {
        return birdAssets[petId]?.name || petId;
    };

    const getPetDescription = (petId) => {
        const descriptions = {
            novice: "Your first companion on the learning journey",
            apprentice: "A dedicated learner growing stronger each day",
            scholar: "A wise companion with extensive knowledge",
            sage: "An enlightened being of great wisdom",
            master: "The ultimate companion - majestic and powerful"
        };
        return descriptions[petId] || "";
    };

    const getPetRankColor = (petId) => {
        const colors = {
            novice: "from-gray-400 to-gray-600",
            apprentice: "from-blue-400 to-blue-600",
            scholar: "from-purple-400 to-purple-600",
            sage: "from-yellow-400 to-yellow-600",
            master: "from-rose-400 via-purple-400 to-blue-600"
        };
        return colors[petId] || "from-gray-400 to-gray-600";
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Choose Your Companion</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {unlockedPets.map((petId) => {
                        const isActive = petId === activePet;
                        const petAsset = birdAssets[petId];
                        
                        return (
                            <button
                                key={petId}
                                onClick={() => onSelectPet(petId)}
                                className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
                                    isActive 
                                        ? 'border-yellow-400 bg-zinc-800/50' 
                                        : 'border-zinc-700 bg-zinc-800/30 hover:border-zinc-600 hover:bg-zinc-800/40'
                                }`}
                            >
                                {isActive && (
                                    <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded-full font-semibold">
                                        ACTIVE
                                    </div>
                                )}
                                
                                <div className="flex flex-col items-center gap-3">
                                    <div className={`w-24 h-24 rounded-full bg-gradient-to-b ${getPetRankColor(petId)} p-1`}>
                                        <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center">
                                            <img
                                                src={petAsset.idle}
                                                alt={petAsset.name}
                                                className="w-20 h-20 object-contain"
                                                style={{ imageRendering: 'crisp-edges' }}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="text-center">
                                        <h3 className="text-white font-semibold text-lg">
                                            {getPetDisplayName(petId)}
                                        </h3>
                                        <p className="text-gray-400 text-sm mt-1">
                                            {getPetDescription(petId)}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="mt-6 p-4 bg-zinc-800/50 rounded-lg">
                    <p className="text-gray-300 text-sm text-center">
                        Unlock more companions by increasing your study time and rank!
                    </p>
                </div>
            </div>
        </div>
    );
}

export default PetSelectionModal;