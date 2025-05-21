import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const SessionContext = createContext();

export const useSession = () => useContext(SessionContext);

export const SessionProvider = ({ children }) => {
  // Session state
  const [session, setSession] = useState(null);
  const [isInSession, setIsInSession] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [sessionExpiry, setSessionExpiry] = useState(null);
  
  // Participants state
  const [participants, setParticipants] = useState(0);
  const [participantNames, setParticipantNames] = useState([]);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);

  // Time synchronization
  const [serverTimeOffset, setServerTimeOffset] = useState(0);

  // Check for existing session on load
  useEffect(() => {
    checkExistingSession();
  }, []);

  // Poll for session updates when in an active session
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
          updateSessionState(data.session, data.userId);
        }
      }
    } catch (error) {
      console.error('Error checking existing session:', error);
    }
  };

  // Update all session state from session data
  const updateSessionState = (sessionData, userId) => {
    setSession(sessionData);
    setIsInSession(true);
    
    // Update participant count
    setParticipants(sessionData.participants.length + 1); // +1 for creator
    
    // Determine if current user is the creator
    const currentUserId = userId || localStorage.getItem('userId');
    const userIsCreator = currentUserId && sessionData.creator === currentUserId;
    setIsCreator(userIsCreator);
    
    setSessionStarted(sessionData.isActive);
    setSessionDuration(sessionData.duration);
    
    // Set up participants list
    updateParticipantsList(sessionData, currentUserId);
    
    // If session is already active, set the expiry time
    if (sessionData.isActive && sessionData.startTime) {
      const expiryTime = new Date(sessionData.expiresAt);
      setSessionExpiry(expiryTime);
    }
  };

  // Function to update participants list
const updateParticipantsList = (sessionData, currentUserId) => {
  console.log("Updating participants list:", {
    creator: sessionData.creator,
    participants: sessionData.participants,
    currentUserId
  });
  
  const participantsList = [];
  const currentUsername = localStorage.getItem('username') || 'You';
  
  // Add the creator (with their actual username)
  if (sessionData.creator === currentUserId) {
    // This is us
    participantsList.push(currentUsername);
  } else {
    // Add creator's username if we have it, otherwise use their ID
    participantsList.push(localStorage.getItem('creatorName') || 'Tryhard');
  }
  
  // Add all participants with their usernames
  if (sessionData.participants && sessionData.participants.length > 0) {
    sessionData.participants.forEach(participantId => {
      if (participantId === currentUserId) {
        // This is us - we were already added if we're the creator
        if (sessionData.creator !== currentUserId) {
          participantsList.push(currentUsername);
        }
      } else {
        // Add the participant with their username if available
        const participantName = localStorage.getItem(`user_${participantId}`) || 'Tryhard';
        participantsList.push(participantName);
      }
    });
  }
  
  console.log("Updated participants list:", participantsList);
  setParticipantNames(participantsList);
};


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
      
      // Update participant count
      setParticipants(data.participants.length + 1); // +1 for creator
      
      // Update participants list
      const currentUserId = localStorage.getItem('userId');
      updateParticipantsList({ ...session, participants: data.participants }, currentUserId);
      
      // Update session started status
      if (!sessionStarted && data.isActive) {
        console.log("Session was started by host:", {
          startTime: data.startTime,
          expiresAt: data.expiresAt
        });
        
        setSessionStarted(true);
        
        // Set session expiry for timer calculations
        if (data.startTime) {
          // Calculate the remaining time
          const startTime = new Date(data.startTime).getTime();
          const expiryTime = data.expiresAt 
            ? new Date(data.expiresAt).getTime() 
            : startTime + (sessionDuration * 1000);
            
          // Set the expiry time
          setSessionExpiry(new Date(expiryTime));
          
          // Update session data with the start and end times
          setSession(prev => ({
            ...prev,
            startTime: data.startTime,
            expiresAt: data.expiresAt || new Date(expiryTime).toISOString()
          }));
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
}, [session, sessionStarted, sessionDuration]);

  const resetSessionState = () => {
    setSession(null);
    setIsInSession(false);
    setParticipants(0);
    setIsCreator(false);
    setSessionStarted(false);
    setSessionDuration(0);
    setSessionExpiry(null);
    setParticipantNames([]);
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
        
        // Store user ID if provided
        if (data.userId) {
          localStorage.setItem('userId', data.userId);
        }
        
        // Update state
        setSession(data);
        setIsInSession(true);
        setParticipants(1); // Creator starts alone
        setIsCreator(true);
        setSessionStarted(false);
        setSessionDuration(duration);
        
        // Set the host in participants list
        setParticipantNames(["Host"]);
        
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
      
      // Store user ID for session tracking
      if (data.userId) {
        localStorage.setItem('userId', data.userId);
      }
      
      // Store creator info if provided
      if (data.creatorUsername) {
        localStorage.setItem('creatorName', data.creatorUsername);
      }
      
      updateSessionState(data, data.userId);
      return data;
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
      
      const token = localStorage.getItem('userToken');
      const response = await fetch(`http://localhost:5000/sessions/${session._id}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update server time offset for synchronization
        const serverTime = new Date(data.serverTime).getTime();
        const clientTime = Date.now();
        const offset = serverTime - clientTime;
        setServerTimeOffset(offset);
        
        // Update the session state
        setSession({
          ...session,
          startTime: data.startTime,
          expiresAt: data.expiresAt,
          isActive: true
        });
        
        setSessionStarted(true);
        
        // Set session expiry from startTime + duration
        const expiryTime = new Date(data.expiresAt);
        setSessionExpiry(expiryTime);
        
        setIsLoadingParticipants(false);
        return data;
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
      return true;
    } catch (error) {
      console.error('Error leaving session:', error);
      // Still reset state even if API call fails
      resetSessionState();
      return false;
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
        serverTimeOffset,
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