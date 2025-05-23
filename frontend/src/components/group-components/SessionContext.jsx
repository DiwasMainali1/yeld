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
  
  // Participants state with avatar support
  const [participants, setParticipants] = useState(0);
  const [participantNames, setParticipantNames] = useState([]);
  const [participantAvatars, setParticipantAvatars] = useState({});
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);

  // Time synchronization
  const [serverTimeOffset, setServerTimeOffset] = useState(0);

  // Session completion tracking
  const [sessionCompleted, setSessionCompleted] = useState(false);

  // Check for existing session on load
  useEffect(() => {
    checkExistingSession();
  }, []);

  // ENHANCED: More frequent polling when session is not started but user is in session
  useEffect(() => {
    let intervalId;
    
    if (isInSession && session && !sessionCompleted) {
      // Poll more frequently if session hasn't started yet (participants waiting for host)
      const pollInterval = sessionStarted ? 2000 : 1000; // 1s when waiting, 2s when active
      
      intervalId = setInterval(() => {
        checkSessionStatus();
      }, pollInterval);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isInSession, session, sessionCompleted, sessionStarted]);

  const checkExistingSession = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        return;
      }

      const response = await fetch('http://localhost:5000/sessions/check', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.session) {
          await updateSessionState(data.session, data.userId);
        }
      }
    } catch (error) {
      console.error('Error checking existing session:', error);
    }
  };

  // Fetch user avatar by username
  const fetchUserAvatar = async (username) => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token || !username) {
        console.warn('Missing token or username for avatar fetch');
        return 'fox';
      }

      const response = await fetch(`http://localhost:5000/profile/${username}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.avatar || 'fox';
      } else {
        console.warn(`❌ Failed to fetch avatar for ${username}:`, response.status, response.statusText);
        return 'fox';
      }
    } catch (error) {
      console.error('Error fetching user avatar:', error);
    }
    return 'fox';
  };

  // Cache avatars to avoid repeated fetches
  const avatarCache = new Map();

  const getCachedAvatar = async (username) => {
    
    if (avatarCache.has(username)) {
      const cachedAvatar = avatarCache.get(username);
      return cachedAvatar;
    }
    
    const avatar = await fetchUserAvatar(username);
    avatarCache.set(username, avatar);
    return avatar;
  };

  // ENHANCED: Better session state synchronization
  const updateSessionState = async (sessionData, userId) => {
    const wasSessionStarted = sessionStarted;
    
    setSession(sessionData);
    setIsInSession(true);
    
    // Update participant count
    setParticipants(sessionData.participants.length + 1);
    
    // Determine if current user is the creator
    const currentUserId = userId || localStorage.getItem('userId');
    const userIsCreator = currentUserId && sessionData.creator === currentUserId;
    setIsCreator(userIsCreator);
    
    const isSessionActive = sessionData.isActive;
    setSessionStarted(isSessionActive);
    setSessionDuration(sessionData.duration);
    
    // Reset completion flag when updating session state
    setSessionCompleted(false);
    
    // Set up participants list with avatars
    await updateParticipantsListWithAvatars(sessionData, currentUserId);
    
    // CRITICAL: Handle session start synchronization for participants
    if (isSessionActive && !wasSessionStarted && !userIsCreator) {
      console.log('🚀 Session started detected by participant, syncing timer...');
      
      // Calculate server time offset if we have server time data
      if (sessionData.serverTime) {
        const serverTime = new Date(sessionData.serverTime).getTime();
        const clientTime = Date.now();
        const offset = serverTime - clientTime;
        setServerTimeOffset(offset);
        console.log("Server time offset set to:", offset);
      }
      
      // Set session expiry from the provided data
      if (sessionData.expiresAt) {
        const expiryTime = new Date(sessionData.expiresAt);
        setSessionExpiry(expiryTime);
        console.log("Session expiry set to:", expiryTime.toISOString());
      } else if (sessionData.startTime) {
        // Fallback: calculate expiry from start time + duration
        const startTime = new Date(sessionData.startTime);
        const expiryTime = new Date(startTime.getTime() + sessionData.duration * 1000);
        setSessionExpiry(expiryTime);
        console.log("Session expiry calculated:", expiryTime.toISOString());
      }
    }
    
    // If session is already active, set the expiry time
    if (isSessionActive && sessionData.startTime) {
      const expiryTime = new Date(sessionData.expiresAt || 
        new Date(sessionData.startTime).getTime() + sessionData.duration * 1000);
      setSessionExpiry(expiryTime);
    }
  };

  const updateParticipantsListWithAvatars = async (sessionData, currentUserId) => {
    
    // Clear current user's cached avatar to ensure fresh data
    const currentUsername = localStorage.getItem('username') || 'You';
    if (avatarCache.has(currentUsername)) {
      avatarCache.delete(currentUsername);
    }
    
    const participantsList = [];
    const avatarMap = {};
    
    // Determine creator's display name and avatar
    const creatorUsername = sessionData.creator === currentUserId 
      ? currentUsername 
      : (sessionData.creatorUsername || localStorage.getItem('creatorName') || 'Unknown');
    
    // Always add the creator with (Host) label first
    const creatorDisplayName = creatorUsername + " (Host)";
    participantsList.push(creatorDisplayName);
    
    // Get creator's avatar
    if (sessionData.creator === currentUserId) {
      const avatar = await getCachedAvatar(currentUsername);
      avatarMap[creatorDisplayName] = avatar;
      localStorage.setItem('userAvatar', avatar);
    } else if (sessionData.creatorAvatar) {
      avatarMap[creatorDisplayName] = sessionData.creatorAvatar;
    } else {
      const avatar = await getCachedAvatar(creatorUsername);
      avatarMap[creatorDisplayName] = avatar;
    }
    
    // Process participants array (if available)
    if (sessionData.participants && sessionData.participants.length > 0) {
      for (const participantId of sessionData.participants) {
        // Skip the creator since we already added them with (Host) label
        if (participantId === sessionData.creator) {
          continue;
        }
        
        let participantName;
        
        if (participantId === currentUserId) {
          participantName = currentUsername;
        } 
        else if (sessionData.participantUsernames && sessionData.participantUsernames[participantId]) {
          participantName = sessionData.participantUsernames[participantId];
        }
        else {
          participantName = localStorage.getItem(`user_${participantId}`) || 'User';
        }
        
        // Only add if not already in the list
        if (!participantsList.includes(participantName)) {
          participantsList.push(participantName);
          
          // Get participant's avatar
          if (participantId === currentUserId) {
            const avatar = await getCachedAvatar(currentUsername);
            avatarMap[participantName] = avatar;
            localStorage.setItem('userAvatar', avatar);
          } else if (sessionData.participantAvatars && sessionData.participantAvatars[participantId]) {
            avatarMap[participantName] = sessionData.participantAvatars[participantId];
          } else {
            const avatar = await getCachedAvatar(participantName);
            avatarMap[participantName] = avatar;
          }
        }
      }
    }
    

    setParticipantNames(participantsList);
    setParticipantAvatars(avatarMap);
  };

  // ENHANCED: Better session status checking with session start detection
  const checkSessionStatus = useCallback(async () => {
    if (!session || sessionCompleted) return;
    
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
        
        if (data.expired) {
          setSessionCompleted(true);
          
          setTimeout(() => {
            resetSessionState();
          }, 1000);
          return;
        }
        
        // CRITICAL: Check for session start changes
        const wasSessionActive = sessionStarted;
        const isNowActive = data.isActive;
        
        if (isNowActive && !wasSessionActive && !isCreator) {
          console.log('🎯 Session start detected in status check!');
          
          // Update session state with the new active status
          const updatedSessionData = {
            ...session,
            isActive: isNowActive,
            startTime: data.startTime,
            expiresAt: data.expiresAt,
            serverTime: data.serverTime
          };
          
          // This will trigger the timer sync in updateSessionState
          await updateSessionState(updatedSessionData, localStorage.getItem('userId'));
          return; // Early return since updateSessionState handles everything
        }
        
        setParticipants(data.participants.length + 1);
        
        if (data.participantUsernames) {
          Object.entries(data.participantUsernames).forEach(([id, username]) => {
            localStorage.setItem(`user_${id}`, username);
          });
        }
        
        const currentUserId = localStorage.getItem('userId');
        await updateParticipantsListWithAvatars({
          ...session,
          participants: data.participants,
          participantUsernames: data.participantUsernames,
          creatorUsername: data.creatorUsername,
          participantAvatars: data.participantAvatars,
          creatorAvatar: data.creatorAvatar
        }, currentUserId);
      }
    } catch (error) {
      console.error('Error checking session status:', error);
    }
  }, [session, sessionCompleted, sessionStarted, isCreator]);

const resetSessionState = () => {
  console.log('Resetting session state');
  setSession(null);
  setIsInSession(false);
  setParticipants(0);
  setIsCreator(false);
  setSessionStarted(false);
  setSessionDuration(0);
  setSessionExpiry(null);
  setParticipantNames([]);
  setParticipantAvatars({});
  setSessionCompleted(false);
  setServerTimeOffset(0);
  avatarCache.clear();
  
  localStorage.removeItem('creatorName');
  localStorage.removeItem('userId');
};

  // Function to force refresh a specific user's avatar
  const refreshUserAvatar = async (username) => {
    avatarCache.delete(username);
    const avatar = await getCachedAvatar(username);
    
    // Update the avatar in current participants list if present
    setParticipantAvatars(prev => ({
      ...prev,
      [username]: avatar,
      [`${username} (Host)`]: avatar // Also update if they're a host
    }));
    
    return avatar;
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
        setParticipants(1);
        setIsCreator(true);
        setSessionStarted(false);
        setSessionDuration(duration);
        setSessionCompleted(false); // Reset completion flag
        
        // Set up initial participant list with creator
        const currentUsername = localStorage.getItem('username') || 'Host';
        const creatorDisplayName = currentUsername + " (Host)";
        setParticipantNames([creatorDisplayName]);
        
        // Get creator's avatar
        const savedAvatar = localStorage.getItem('userAvatar');
        if (savedAvatar) {
          setParticipantAvatars({ [creatorDisplayName]: savedAvatar });
        } else {
          const avatar = await getCachedAvatar(currentUsername);
          setParticipantAvatars({ [creatorDisplayName]: avatar });
          localStorage.setItem('userAvatar', avatar);
        }
        
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
        
        if (data.userId) {
          localStorage.setItem('userId', data.userId);
        }
        
        if (data.creatorUsername) {
          localStorage.setItem('creatorName', data.creatorUsername);
        }
        
        await updateSessionState(data, data.userId);
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
        setSessionCompleted(false); // Reset completion flag when starting
        
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

  // Function to mark session as completed (called from Dashboard)
  const markSessionCompleted = () => {
    setSessionCompleted(true);
  };

  return (
    <SessionContext.Provider
      value={{
        session,
        isInSession,
        participants,
        participantNames,
        participantAvatars,
        isLoadingParticipants,
        isCreator,
        sessionStarted,
        sessionDuration,
        sessionExpiry,
        serverTimeOffset,
        sessionCompleted,
        createSession,
        joinSession,
        startSession,
        leaveSession,
        checkSessionStatus,
        markSessionCompleted,
        fetchUserAvatar: getCachedAvatar,
        refreshUserAvatar,
        resetSessionState
      }}
    >
      {children}
    </SessionContext.Provider>
  )
};