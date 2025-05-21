import React from 'react';
import { X, User } from 'lucide-react';

const SessionParticipantsModal = ({ isOpen, onClose, participantsList }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative bg-zinc-950 rounded-2xl border border-zinc-800 shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-white">Session Participants</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {participantsList && participantsList.length > 0 ? (
            <ul className="divide-y divide-zinc-800/50">
              {participantsList.map((name, index) => (
                <li
                  key={index}
                  className="px-4 py-3 flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-400" />
                  </div>
                  <span className="text-white">{name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-gray-400 py-6">
              No participants yet
            </div>
          )}
        </div>
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
          <div className="text-sm text-gray-400 text-center">
            {participantsList && participantsList.length} {participantsList && participantsList.length === 1 ? 'Participant' : 'Participants'}
          </div>
          <button
            onClick={onClose}
            className="mt-2 w-full py-2 px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionParticipantsModal;