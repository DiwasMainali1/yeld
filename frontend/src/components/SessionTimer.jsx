import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, X, Users } from 'lucide-react';
import { useSession } from './SessionContext';

const SessionTimer = ({ 
  time, 
  setTime, 
  isActive, 
  setIsActive, 
  timerSessionStarted, 
  setTimerSessionStarted, 
  resetTimer, 
  formatTime, 
  updateUserStats, 
  timerType,
  pomodoroDuration
}) => {
  const { 
    isInSession, 
    leaveSession, 
    startSession, 
    sessionStarted, 
    isCreator,
    participants,
    sessionDuration 
  } = useSession();

  const audioRef = useRef(new Audio('../music/notification.mp3'));
  const sessionTimerRef = useRef(null);

  // Update timer if session gets started
  useEffect(() => {
    if (sessionStarted && !isActive) {
      // Set the timer duration to the session duration
      setTime(sessionDuration);
      // Start the timer
      setIsActive(true);
      setTimerSessionStarted(true);
      
      // Clear existing interval if any
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
      
      // Set up a new interval
      sessionTimerRef.current = setInterval(() => {
        setTime(prevTime => {
          if (prevTime <= 1) {
            // Time's up - handle session completion
            clearInterval(sessionTimerRef.current);
            audioRef.current.play().catch(error => console.error('Error playing alarm:', error));
            updateUserStats();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    };
  }, [sessionStarted, isActive, sessionDuration, setIsActive, setTime, setTimerSessionStarted, updateUserStats]);

  const toggleTimer = () => {
    if (isInSession && !sessionStarted && isCreator) {
      // Start group session
      startSession();
    } else if (!isInSession) {
      // Regular timer toggle
      if (!isActive && !timerSessionStarted) {
        setTimerSessionStarted(true);
      }
      setIsActive(!isActive);
    }
  };

  const handleExitSession = async () => {
    if (window.confirm('Are you sure you want to exit the session? Your current progress will be saved.')) {
      // If time has passed, update the user stats first
      if (time < sessionDuration) {
        await updateUserStats();
      }
      await leaveSession();
      setIsActive(false);
      setTimerSessionStarted(false);
      setTime(pomodoroDuration); // Reset to regular pomodoro
    }
  };

  return (
    <div className="text-center">
      {isInSession && sessionStarted && (
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-green-400 font-medium">
            <Users className="w-5 h-5" />
            <span>Group Session Timer</span>
          </div>
          <button
            onClick={handleExitSession}
            className="flex items-center gap-2 bg-red-900/30 text-red-400 px-3 py-1 rounded-lg hover:bg-red-900/50 text-sm transition-colors"
          >
            <X className="w-4 h-4" />
            Exit Session
          </button>
        </div>
      )}
      
      <div className="mb-6">
        <h2 className="text-8xl font-bold text-white font-mono tracking-widest">
          {formatTime(time)}
        </h2>
      </div>

      <div className="flex justify-center gap-6 mb-6">
        {(!isInSession || (isInSession && isCreator && !sessionStarted)) && (
          <button
            onClick={toggleTimer}
            className={`${
              isInSession && !sessionStarted && isCreator 
                ? "bg-green-600 hover:bg-green-700" 
                : "bg-zinc-900/30 hover:bg-zinc-800"
            } text-white p-6 rounded-full border border-zinc-800 transition duration-300 shadow-lg hover:shadow-zinc-900/25`}
          >
            {isActive ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8" />
            )}
          </button>
        )}
        
        {/* Only show reset button if not in an active group session */}
        {(!isInSession || (isInSession && !sessionStarted)) && (
          <button
            onClick={resetTimer}
            className="bg-zinc-900/30 text-white p-6 rounded-full hover:bg-zinc-800 border border-zinc-800 transition duration-300 shadow-lg hover:shadow-zinc-900/25"
          >
            <RotateCcw className="w-8 h-8" />
          </button>
        )}
      </div>
      
      {/* Session participant count during active session */}
      {isInSession && sessionStarted && (
        <div className="flex justify-center mt-4">
          <div className="flex items-center gap-2 bg-zinc-900/50 px-4 py-2 rounded-xl">
            <Users className="w-5 h-5 text-green-400" />
            <span className="text-white">
              {participants} {participants === 1 ? 'Participant' : 'Participants'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionTimer;