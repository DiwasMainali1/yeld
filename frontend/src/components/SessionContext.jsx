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
      }, 2000);
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
    setParticipants(sessionData.participants.length + 1);
    
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
    console.log("Updating participants list with data:", {
      creator: sessionData.creator,
      participants: sessionData.participants,
      currentUserId,
      participantUsernames: sessionData.participantUsernames || {}
    });
    
    // Create a new empty array for the participant list
    const participantsList = [];
    const currentUsername = localStorage.getItem('username') || 'You';
    
    // Get creator username (could be us or someone else)
    const creatorUsername = sessionData.creator === currentUserId 
      ? currentUsername 
      : (sessionData.creatorUsername || localStorage.getItem('creatorName') || 'Unknown');
    
    // Add creator to the list (but don't add duplicates)
    if (!participantsList.includes(creatorUsername)) {
      participantsList.push(creatorUsername);
    }
    
    // Process participants array (if available)
    if (sessionData.participants && sessionData.participants.length > 0) {
      // Iterate through all participants
      sessionData.participants.forEach(participantId => {
        let participantName;
        
        // If this participant is the current user
        if (participantId === currentUserId) {
          participantName = currentUsername;
        } 
        // If we have usernames from the server response
        else if (sessionData.participantUsernames && sessionData.participantUsernames[participantId]) {
          participantName = sessionData.participantUsernames[participantId];
        }
        // Use stored username if available
        else {
          participantName = localStorage.getItem(`user_${participantId}`) || 'User';
        }
        
        // Only add if not already in the list
        if (!participantsList.includes(participantName)) {
          participantsList.push(participantName);
        }
      });
    }
    
    console.log("Final participants list:", participantsList);
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
      if (response.status === 404) {
        resetSessionState();
        return;
      }
      if (response.ok) {
        const data = await response.json();
        
        setParticipants(data.participants.length + 1);
        
        if (data.participantUsernames) {
          Object.entries(data.participantUsernames).forEach(([id, username]) => {
            localStorage.setItem(`user_${id}`, username);
          });
        }
        
        if (data.creatorUsername) {
          localStorage.setItem('creatorName', data.creatorUsername);
        }
        
        // Update participants list with full data
        const currentUserId = localStorage.getItem('userId');
        updateParticipantsList({
          ...session,
          participants: data.participants,
          participantUsernames: data.participantUsernames,
          creatorUsername: data.creatorUsername
        }, currentUserId);
        
        // Handle session status updates
        if (!sessionStarted && data.isActive) {
          setSessionStarted(true);
          
          if (data.startTime) {
            // Set session expiry for timer calculations
            const expiryTime = data.expiresAt 
              ? new Date(data.expiresAt) 
              : new Date(new Date(data.startTime).getTime() + sessionDuration * 1000);
              
            setSessionExpiry(expiryTime);
            
            // Update session object with timing data
            setSession(prev => ({
              ...prev,
              startTime: data.startTime,
              expiresAt: data.expiresAt || expiryTime.toISOString()
            }));
          }
        }
        
        // Handle expired or deleted sessions
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