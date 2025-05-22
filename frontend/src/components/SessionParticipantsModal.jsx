import React from 'react';
import { X, Crown, Users } from 'lucide-react';
import { useSession } from './SessionContext';

// Import animal avatar images
import foxImage from '../assets/fox.png';
import owlImage from '../assets/owl.png';
import pandaImage from '../assets/panda.png';
import penguinImage from '../assets/penguin.png';
import koalaImage from '../assets/koala.png';

const animalAvatars = {
  fox: foxImage,
  owl: owlImage,
  panda: pandaImage,
  penguin: penguinImage,
  koala: koalaImage
};

const SessionParticipantsModal = ({ isOpen, onClose }) => {
  const { 
    participantNames, 
    participantAvatars, 
    participants, 
    sessionStarted,
    isLoadingParticipants 
  } = useSession();

  if (!isOpen) return null;

  const getAvatarImage = (avatarType) => {
    return animalAvatars[avatarType] || animalAvatars.fox;
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative bg-zinc-950 rounded-2xl border border-zinc-800 shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-gray-200" />
            <h2 className="text-xl font-bold text-white">Session Participants</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {isLoadingParticipants ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-300 mb-4"></div>
              <p className="text-gray-400">Loading participants...</p>
            </div>
          ) : participantNames && participantNames.length > 0 ? (
            <div className="p-4">
              <div className="space-y-3">
                {participantNames.map((name, index) => {
                  const isHost = name.includes('(Host)');
                  const avatar = participantAvatars[name] || 'fox';
                  
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-zinc-900/50 transition-colors"
                    >
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800 border-2 border-zinc-700">
                          <img 
                            src={getAvatarImage(avatar)} 
                            alt={`${name} avatar`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {isHost && (
                          <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-1">
                            <Crown className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <span className={`font-medium ${isHost ? 'text-amber-400' : 'text-gray-200'}`}>
                          {name}
                        </span>
                        {isHost && (
                          <div className="text-xs text-amber-300/70 mt-0.5">
                            Session Host
                          </div>
                        )}
                      </div>
                      
                      {sessionStarted && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-xs text-green-400">Active</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-12">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p>No participants yet</p>
              <p className="text-sm mt-1">Share the session link to invite others</p>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/30">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-400">
              Total Participants: <span className="text-white font-medium">{participants}</span>
            </div>
            {sessionStarted && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-400 font-medium">Session Active</span>
              </div>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionParticipantsModal;