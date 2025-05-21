import React, { useState, useEffect } from 'react';
import { Users, Link, X, Clock, Play } from 'lucide-react';
import { useSession } from './SessionContext';

const GroupSession = () => {
  const { 
    isInSession, 
    createSession, 
    joinSession, 
    leaveSession,
    startSession,
    participants,
    isCreator,
    sessionStarted,
    sessionDuration,
    session
  } = useSession();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [duration, setDuration] = useState(25); // Default 25 minutes
  const [sessionLink, setSessionLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Generate session link when session is created
  useEffect(() => {
    if (session && isCreator && !sessionStarted) {
      setSessionLink(`${window.location.origin}/dashboard?session=${session._id}`);
    }
  }, [session, isCreator, sessionStarted]);

  const handleCreateSession = async () => {
    setError('');
    setIsLoading(true);
    
    try {
      // Convert minutes to seconds for the API
      const sessionId = await createSession(duration * 60);
      
      if (sessionId) {
        const link = `${window.location.origin}/dashboard?session=${sessionId}`;
        setSessionLink(link);
        setShowCreateModal(false);
      } else {
        setError('Failed to create session. Please try again.');
      }
    } catch (err) {
      setError('Error creating session. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinSession = async () => {
    setError('');
    setIsLoading(true);
    
    if (!sessionId.trim()) {
      setError('Please enter a session ID');
      setIsLoading(false);
      return;
    }
    
    try {
      // Extract session ID if a full URL was pasted
      let idToJoin = sessionId;
      if (sessionId.includes('session=')) {
        try {
          const url = new URL(sessionId);
          const extractedId = url.searchParams.get('session');
          if (extractedId) {
            idToJoin = extractedId;
          }
        } catch (e) {
          // If URL parsing fails, use the original input
          console.error('Error parsing session URL:', e);
        }
      }
      
      const success = await joinSession(idToJoin);
      if (success) {
        setShowJoinModal(false);
      } else {
        setError('Failed to join session. Please check the ID and try again.');
      }
    } catch (err) {
      setError('Error joining session. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sessionLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExitSession = async () => {
    if (window.confirm('Are you sure you want to exit the session?')) {
      await leaveSession();
    }
  };

  const handleStartSession = async () => {
    setIsLoading(true);
    try {
      await startSession();
    } catch (err) {
      console.error('Error starting session:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isInSession) {
    return (
      <div className="mt-4 bg-zinc-900 rounded-xl p-4 border border-zinc-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-green-400" />
            <span className="text-white font-medium">
              Group Session
            </span>
          </div>
          
          <button 
            onClick={handleExitSession}
            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Exit
          </button>
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300 text-sm">
            {participants} Participant{participants !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300 text-sm">
            {Math.floor(sessionDuration / 60)} minute{Math.floor(sessionDuration / 60) !== 1 ? 's' : ''}
          </span>
        </div>
        
        {!sessionStarted && isCreator && (
          <>
            <div className="mt-3 text-xs text-gray-400">
              <p>Share this link to invite others to your session:</p>
              <div className="flex items-center gap-2 mt-1">
                <input 
                  type="text" 
                  value={sessionLink} 
                  readOnly 
                  className="flex-1 bg-zinc-800 p-1 rounded text-gray-300 text-xs"
                />
                <button 
                  onClick={copyToClipboard}
                  className="bg-zinc-700 hover:bg-zinc-600 px-2 py-1 rounded text-xs"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            
            <div className="mt-4">
              <button
                onClick={handleStartSession}
                disabled={isLoading}
                className={`w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors ${isLoading ? 'opacity-70' : ''}`}
              >
                {isLoading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Start Session
                  </>
                )}
              </button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Once started, all participants will begin the timer together.
              </p>
            </div>
          </>
        )}
        
        {!sessionStarted && !isCreator && (
          <div className="mt-3 text-center text-gray-400 text-sm">
            <p>Waiting for host to start the session...</p>
          </div>
        )}
        
        {sessionStarted && (
          <div className="mt-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm">Session in progress</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="mt-4 flex space-x-2">
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <Users className="w-4 h-4" />
          Create Session
        </button>
        
        <button
          onClick={() => setShowJoinModal(true)}
          className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <Link className="w-4 h-4" />
          Join Session
        </button>
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-lg font-semibold">Create Group Session</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {error && (
              <div className="mb-4 p-2 bg-red-900/30 border border-red-800 rounded text-red-200 text-sm">
                {error}
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-gray-300 mb-2 text-sm">Session Duration (minutes)</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white"
              >
                <option value={25}>25 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={50}>50 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes</option>
                <option value={120}>2 hours</option>
              </select>
            </div>
            
            <div className="text-gray-400 text-sm mb-6">
              <p>Create a study session and invite up to 9 other people to join.</p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSession}
                disabled={isLoading}
                className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 ${isLoading ? 'opacity-70' : ''}`}
              >
                {isLoading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                ) : 'Create Session'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Session Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-lg font-semibold">Join Group Session</h3>
              <button 
                onClick={() => setShowJoinModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {error && (
              <div className="mb-4 p-2 bg-red-900/30 border border-red-800 rounded text-red-200 text-sm">
                {error}
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-gray-300 mb-2 text-sm">Session ID or Link</label>
              <input
                type="text"
                value={sessionId}
                onChange={(e) => {
                  setSessionId(e.target.value);
                }}
                placeholder="Enter session ID or paste link"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white"
              />
            </div>
            
            <div className="text-gray-400 text-sm mb-6">
              <p>Join an existing study session using the session ID or link shared with you.</p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowJoinModal(false)}
                className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinSession}
                disabled={isLoading}
                className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 ${isLoading ? 'opacity-70' : ''}`}
              >
                {isLoading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                ) : 'Join Session'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GroupSession;