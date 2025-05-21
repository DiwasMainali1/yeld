import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const SessionContext = createContext();

export const useSession = () => useContext(SessionContext);

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [isInSession, setIsInSession] = useState(false);
  const [participants, setParticipants] = useState(0);
  const [isCreator, setIsCreator] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [sessionExpiry, setSessionExpiry] = useState(null);
  const [participantNames, setParticipantNames] = useState([]);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);

  // Check for existing session on load
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (!token) return;

        const response = await fetch('http://localhost:5000/sessions/check', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.session) {
            setSession(data.session);
            setIsInSession(true);
            setParticipants(data.session.participants.length + 1); // +1 for creator
            setIsCreator(data.session.creator === data.userId);
            setSessionStarted(data.session.isActive);
            setSessionDuration(data.session.duration);
            
            if (data.session.isActive && data.session.startTime) {
              // Calculate remaining time
              const startTime = new Date(data.session.startTime);
              const expiryTime = new Date(startTime.getTime() + data.session.duration * 1000);
              setSessionExpiry(expiryTime);
            }
          }
        }
      } catch (error) {
        console.error('Error checking existing session:', error);
      }
    };

    checkExistingSession();
  }, []);

  // Set up polling to check for session updates
  useEffect(() => {
    let intervalId;
    
    if (isInSession && session) {
      intervalId = setInterval(() => {
        checkSessionStatus();
      }, 5000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isInSession, session]);

  const checkSessionStatus = useCallback(async () => {
    if (!session) return;
    
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`http://localhost:5000/sessions/${session._id}/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update participant information
        setParticipants(data.participants.length + 1); // +1 for the creator
        
        // Fetch participant usernames - this would require backend support
        // For now we'll use placeholder data or IDs
        const participantList = ['Session Creator']; // Creator always at index 0
        if (data.participants && data.participants.length > 0) {
          // Assuming participants contain user IDs or usernames
          // In a real app, you might want to fetch actual usernames from the backend
          data.participants.forEach(participant => {
            participantList.push(`Participant ${participant.substring(0, 6)}`);
          });
        }
        setParticipantNames(participantList);
        
        // Update session started status
        if (!sessionStarted && data.isActive) {
          setSessionStarted(true);
          
          // Set session expiry for timer calculations
          if (data.startTime) {
            const startTime = new Date(data.startTime);
            const expiryTime = new Date(startTime.getTime() + sessionDuration * 1000);
            setSessionExpiry(expiryTime);
          }
        }
        
        // If session expired or deleted
        if (data.expired || data.deleted) {
          resetSessionState();
        }
      }
    } catch (error) {
      console.error('Error checking session status:', error);
    }
  }, [session, sessionDuration, sessionStarted]);

  const resetSessionState = () => {
    setSession(null);
    setIsInSession(false);
    setParticipants(0);
    setIsCreator(false);
    setSessionStarted(false);
    setSessionDuration(0);
    setSessionExpiry(null);
  };

  const createSession = async (duration) => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch('http://localhost:5000/sessions/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ duration })
      });

      if (response.ok) {
        const data = await response.json();
        setSession(data);
        setIsInSession(true);
        setParticipants(1); // Creator starts alone
        setIsCreator(true);
        setSessionStarted(false);
        setSessionDuration(duration);
        // Return session ID to be used for link creation
        return data._id;
      }
      return null;
    } catch (error) {
      console.error('Error creating session:', error);
      return null;
    }
  };

  const joinSession = async (sessionId) => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`http://localhost:5000/sessions/${sessionId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSession(data);
        setIsInSession(true);
        setParticipants(data.participants.length + 1); // +1 for creator
        setIsCreator(data.userId && data.creator === data.userId);
        setSessionStarted(data.isActive);
        setSessionDuration(data.duration);
        
        // If session is already active, set the expiry time
        if (data.isActive && data.startTime) {
          const startTime = new Date(data.startTime);
          const expiryTime = new Date(startTime.getTime() + data.duration * 1000);
          setSessionExpiry(expiryTime);
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error joining session:', error);
      return false;
    }
  };

  const startSession = async () => {
    if (!session || !isCreator) return false;
    
    try {
      setIsLoadingParticipants(true);
      
      // First, grab the current participants list
      await checkSessionStatus();
      
      // Then start the session
      const token = localStorage.getItem('userToken');
      const response = await fetch(`http://localhost:5000/sessions/${session._id}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSessionStarted(true);
        
        // Set session expiry from startTime + duration
        if (data.startTime) {
          const startTime = new Date(data.startTime);
          const expiryTime = new Date(startTime.getTime() + sessionDuration * 1000);
          setSessionExpiry(expiryTime);
        }
        
        setIsLoadingParticipants(false);
        return true;
      }
      
      setIsLoadingParticipants(false);
      return false;
    } catch (error) {
      console.error('Error starting session:', error);
      setIsLoadingParticipants(false);
      return false;
    }
  };

  const leaveSession = async () => {
    if (!session) return;
    
    try {
      const token = localStorage.getItem('userToken');
      await fetch(`http://localhost:5000/sessions/${session._id}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Reset state regardless of response
      resetSessionState();
    } catch (error) {
      console.error('Error leaving session:', error);
      // Still reset state even if API call fails
      resetSessionState();
    }
  };

  return (
    <SessionContext.Provider
      value={{
        session,
        isInSession,
        participants,
        participantNames,
        isLoadingParticipants,
        isCreator,
        sessionStarted,
        sessionDuration,
        sessionExpiry,
        createSession,
        joinSession,
        startSession,
        leaveSession,
        checkSessionStatus
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};