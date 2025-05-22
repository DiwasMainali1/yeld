import Session from '../models/sessionModel.js';
import User from '../models/userModel.js';

// @desc    Create a new session
// @route   POST /sessions/create
// @access  Private
export const createSession = async (req, res) => {
  try {
    const { duration } = req.body;
    
    if (!duration || duration < 60 || duration > 7200) {
      return res.status(400).json({ message: 'Invalid duration. Must be between 1 and 120 minutes' });
    }
    
    // Check if user already has an active session
    const existingSession = await Session.findOne({
      $or: [
        { creator: req.user._id },
        { participants: req.user._id }
      ],
      isExpired: false
    });
    
    if (existingSession) {
      return res.status(400).json({ message: 'You already have an active session' });
    }
    
    // Create new session
    const session = await Session.create({
      creator: req.user._id,
      participants: [],
      duration: duration
    });
    
    res.status(201).json({
      _id: session._id,
      duration: session.duration,
      participants: [],
      userId: req.user._id.toString()
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Check user's current session status
// @route   GET /sessions/check
// @access  Private
export const checkSession = async (req, res) => {
  try {
    // Check if user is in a session
    const session = await Session.findOne({
      $or: [
        { creator: req.user._id },
        { participants: req.user._id }
      ]
    });
    
    if (!session) {
      return res.json({ session: null });
    }
    
    // Check if session is expired or completed
    if (session.isExpired) {
      console.log('Session expired, cleaning up:', session._id);
      
      // If the session was active and has finished naturally, update user stats
      if (session.isActive && session.startTime) {
        const startTime = new Date(session.startTime);
        const endTime = new Date(startTime.getTime() + session.duration * 1000);
        
        // Only update stats if the session has reached its natural end time
        if (new Date() >= endTime) {
          await updateSessionStats(req.user._id, session, true);
        }
      }
      
      await Session.deleteOne({ _id: session._id });
      return res.json({ session: null });
    }
    
    // Get creator information with avatar
    const creator = await User.findById(session.creator).select('username avatar');
    const creatorUsername = creator ? creator.username : 'Unknown User';
    const creatorAvatar = creator ? (creator.avatar || 'fox') : 'fox';
    
    // Get participant information with avatars
    let participantUsernames = {};
    let participantAvatars = {};
    
    if (session.participants && session.participants.length > 0) {
      const users = await User.find({
        _id: { $in: session.participants }
      }).select('_id username avatar');
      
      users.forEach(user => {
        participantUsernames[user._id.toString()] = user.username;
        participantAvatars[user._id.toString()] = user.avatar || 'fox';
      });
    }
    
    res.json({
      session: {
        _id: session._id,
        creator: session.creator,
        participants: session.participants,
        duration: session.duration,
        isActive: session.isActive,
        startTime: session.startTime,
        expiresAt: session.expiresAt,
        creatorUsername,
        creatorAvatar,
        participantUsernames,
        participantAvatars
      },
      userId: req.user._id.toString()
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Join an existing session
// @route   POST /sessions/:id/join
// @access  Private
export const joinSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Check if session is expired
    if (session.isExpired) {
      await Session.deleteOne({ _id: session._id });
      return res.status(400).json({ message: 'Session has expired' });
    }
    
    // Check if user is already in another session
    const userInOtherSession = await Session.findOne({
      _id: { $ne: session._id },
      $or: [
        { creator: req.user._id },
        { participants: req.user._id }
      ]
    });
    
    if (userInOtherSession) {
      return res.status(400).json({ message: 'You are already in another session' });
    }
    
    // Get creator information with avatar
    const creator = await User.findById(session.creator).select('username avatar');
    const creatorUsername = creator ? creator.username : 'Unknown User';
    const creatorAvatar = creator ? (creator.avatar || 'fox') : 'fox';
    
    // Get participant information with avatars
    let participantUsernames = {};
    let participantAvatars = {};
    
    if (session.participants && session.participants.length > 0) {
      const users = await User.find({
        _id: { $in: session.participants }
      }).select('_id username avatar');
      
      users.forEach(user => {
        participantUsernames[user._id.toString()] = user.username;
        participantAvatars[user._id.toString()] = user.avatar || 'fox';
      });
    }
    
    // If user is the creator, just return the session with avatar data
    if (session.creator.equals(req.user._id)) {
      return res.json({
        _id: session._id,
        creator: session.creator,
        creatorUsername,
        creatorAvatar,
        participants: session.participants,
        participantUsernames,
        participantAvatars,
        duration: session.duration,
        isActive: session.isActive,
        startTime: session.startTime,
        expiresAt: session.expiresAt,
        serverTime: new Date(),
        userId: req.user._id.toString()
      });
    }
    
    // Add user to participants if not already included
    if (!session.participants.includes(req.user._id)) {
      session.participants.push(req.user._id);
      await session.save();
      
      // Add the new participant to the usernames and avatars objects
      participantUsernames[req.user._id.toString()] = req.user.username;
      participantAvatars[req.user._id.toString()] = req.user.avatar || 'fox';
    }
    
    // Calculate expiresAt if session is active but missing this field
    let expiresAt = session.expiresAt;
    if (session.isActive && session.startTime && !expiresAt) {
      const startTime = new Date(session.startTime);
      expiresAt = new Date(startTime.getTime() + session.duration * 1000);
    }
    
    res.json({
      _id: session._id,
      creator: session.creator,
      creatorUsername,
      creatorAvatar,
      participants: session.participants,
      participantUsernames,
      participantAvatars,
      duration: session.duration,
      isActive: session.isActive,
      startTime: session.startTime,
      expiresAt: expiresAt,
      serverTime: new Date(),
      userId: req.user._id.toString()
    });
  } catch (error) {
    console.error('Error in joinSession:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Start a session
// @route   POST /sessions/:id/start
// @access  Private
export const startSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Only creator can start session
    if (!session.creator.equals(req.user._id)) {
      return res.status(403).json({ message: 'Only the creator can start the session' });
    }
    
    // Check if session is already active
    if (session.isActive) {
      return res.status(400).json({ message: 'Session is already active' });
    }
    
    // Check if session is expired
    if (session.isExpired) {
      await Session.deleteOne({ _id: session._id });
      return res.status(400).json({ message: 'Session has expired' });
    }
    
    // Use exact server time
    const serverTime = new Date();
    session.isActive = true;
    session.startTime = serverTime;
    
    // Set precise end time based on server time
    const serverEndTime = new Date(serverTime.getTime() + session.duration * 1000);
    session.expiresAt = serverEndTime;
    
    await session.save();
    
    console.log(`Session ${session._id} started:`, {
      startTime: serverTime.toISOString(),
      expiresAt: serverEndTime.toISOString(),
      duration: session.duration
    });
    
    res.json({
      _id: session._id,
      isActive: session.isActive,
      startTime: serverTime,
      expiresAt: serverEndTime,
      serverTime: serverTime
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Leave a session
// @route   POST /sessions/:id/leave
// @access  Private
export const leaveSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Check if user is part of the session
    const isUserInSession = session.creator.equals(req.user._id) || 
                          session.participants.some(id => id.equals(req.user._id));
    
    if (!isUserInSession) {
      return res.status(403).json({ message: 'You are not part of this session' });
    }
    
    // Handle session completion stats
    if (session.isActive && session.startTime) {
      const startTime = new Date(session.startTime);
      const sessionEndTime = new Date(startTime.getTime() + session.duration * 1000);
      const now = new Date();
      
      // Check if session completed naturally (reached end time)
      const sessionCompletedNaturally = now >= sessionEndTime;
      
      if (sessionCompletedNaturally) {
        console.log(`User ${req.user._id} completed session ${session._id} naturally`);
        await updateSessionStats(req.user._id, session, true);
      } else {
        console.log(`User ${req.user._id} left session ${session._id} early`);
        // Update stats with partial time only if significant time was spent
        const timeSpent = Math.floor((now - startTime) / 1000);
        if (timeSpent >= 60) { // At least 1 minute
          await updateSessionStats(req.user._id, session, false, timeSpent);
        }
      }
    }
    
    // Check if the leaving user is the creator
    const isCreatorLeaving = session.creator.equals(req.user._id);
    
    if (isCreatorLeaving) {
      console.log(`Creator leaving session ${session._id}, deleting session`);
      // Update stats for all participants before deleting
      if (session.isActive && session.startTime) {
        const allParticipants = [session.creator, ...session.participants];
        for (const participantId of allParticipants) {
          if (!participantId.equals(req.user._id)) { // Skip the leaving creator (already handled above)
            const startTime = new Date(session.startTime);
            const sessionEndTime = new Date(startTime.getTime() + session.duration * 1000);
            const now = new Date();
            const sessionCompletedNaturally = now >= sessionEndTime;
            
            if (sessionCompletedNaturally) {
              await updateSessionStats(participantId, session, true);
            } else {
              const timeSpent = Math.floor((now - startTime) / 1000);
              if (timeSpent >= 60) {
                await updateSessionStats(participantId, session, false, timeSpent);
              }
            }
          }
        }
      }
      
      await Session.deleteOne({ _id: session._id });
      return res.json({ message: 'Session deleted successfully' });
    } else {
      // If participant is leaving, just remove them from participants array
      session.participants = session.participants.filter(id => !id.equals(req.user._id));
      await session.save();
      return res.json({ message: 'Left session successfully' });
    }
    
  } catch (error) {
    console.error('Error in leaveSession:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Session complete - called when timer reaches zero
// @route   POST /sessions/:id/complete
// @access  Private
export const completeSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Check if user is part of the session
    const isUserInSession = session.creator.equals(req.user._id) || 
                          session.participants.some(id => id.equals(req.user._id));
    
    if (!isUserInSession) {
      return res.status(403).json({ message: 'You are not part of this session' });
    }
    
    // Only update stats if session was active and has a startTime
    if (session.isActive && session.startTime) {
      console.log(`Session ${session._id} completed by user ${req.user._id}`);
      await updateSessionStats(req.user._id, session, true);
      
      // Get updated user stats
      const user = await User.findById(req.user._id);
      
      res.json({
        message: 'Session completed successfully',
        stats: {
          sessionsCompleted: user.sessionsCompleted,
          totalTimeStudied: user.totalTimeStudied
        }
      });
    } else {
      res.status(400).json({ message: 'Session was not active' });
    }
  } catch (error) {
    console.error('Error in completeSession:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get session status
// @route   GET /sessions/:id/status
// @access  Private
export const getSessionStatus = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found', deleted: true });
    }
    
    // Check if session is expired
    if (session.isExpired) {
      console.log(`Session ${session._id} has expired, cleaning up`);
      
      // If the session was active and completed naturally, update stats for all participants
      if (session.isActive && session.startTime) {
        const startTime = new Date(session.startTime);
        const endTime = new Date(startTime.getTime() + session.duration * 1000);
        
        // Only update stats if the session has reached its natural end time
        if (new Date() >= endTime) {
          console.log(`Updating stats for all participants in expired session ${session._id}`);
          const allParticipants = [session.creator, ...session.participants];
          
          for (const participantId of allParticipants) {
            await updateSessionStats(participantId, session, true);
          }
        }
      }
      
      // Delete the expired session
      await Session.deleteOne({ _id: session._id });
      
      return res.json({ 
        expired: true,
        message: 'Session has expired and been cleaned up'
      });
    }

    // Check if session should be expired based on time (additional safety check)
    if (session.isActive && session.startTime) {
      const startTime = new Date(session.startTime);
      const endTime = new Date(startTime.getTime() + session.duration * 1000);
      const now = new Date();
      
      if (now >= endTime) {
        console.log(`Session ${session._id} should be expired based on time calculation`);
        
        // Update stats for all participants
        const allParticipants = [session.creator, ...session.participants];
        for (const participantId of allParticipants) {
          await updateSessionStats(participantId, session, true);
        }
        
        // Mark as expired and delete
        await Session.deleteOne({ _id: session._id });
        
        return res.json({ 
          expired: true,
          message: 'Session completed and cleaned up'
        });
      }
    }

    // Get creator information with avatar
    const creator = await User.findById(session.creator).select('username avatar');
    const creatorUsername = creator ? creator.username : 'Unknown User';
    const creatorAvatar = creator ? (creator.avatar || 'fox') : 'fox';
    
    // Get participant usernames and avatars
    let participantUsernames = {};
    let participantAvatars = {};
    
    if (session.participants && session.participants.length > 0) {
      const users = await User.find({
        _id: { $in: session.participants }
      }).select('_id username avatar');
      
      users.forEach(user => {
        participantUsernames[user._id.toString()] = user.username;
        participantAvatars[user._id.toString()] = user.avatar || 'fox';
      });
    }
    
    let expiresAt = session.expiresAt;
    if (session.isActive && session.startTime && !expiresAt) {
      const startTime = new Date(session.startTime);
      expiresAt = new Date(startTime.getTime() + session.duration * 1000);
    }
    
    // Include the current server time for client synchronization
    const serverTime = new Date();
    
    res.json({
      participants: session.participants,
      participantUsernames,
      participantAvatars,
      creatorUsername,
      creatorAvatar,
      creator: session.creator,
      isActive: session.isActive,
      startTime: session.startTime,
      expiresAt: expiresAt,
      serverTime: serverTime,
      expired: false
    });
  } catch (error) {
    console.error('Error in getSessionStatus:', error);
    res.status(400).json({ message: error.message });
  }
};

// Helper function to update user stats when session completes
const updateSessionStats = async (userId, session, sessionCompleted = false, customDuration = null) => {
  try {
    // Only update if the session was active
    if (!session.isActive || !session.startTime) {
      return;
    }
    
    const user = await User.findById(userId);
    if (!user) {
      console.error(`User ${userId} not found for stats update`);
      return;
    }
    
    const sessionId = session._id.toString();
    
    // Check if this session was already completed (within last 5 minutes to be safe)
    if (user.lastCompletedSession && 
        user.lastCompletedSession.sessionId === sessionId &&
        (Date.now() - user.lastCompletedSession.completedAt) < 5 * 60 * 1000) {
      console.log(`Stats already updated for user ${userId} and session ${sessionId}`);
      return;
    }
    
    console.log(`Updating stats for user ${userId}:`, {
      sessionCompleted,
      customDuration,
      sessionDuration: session.duration,
      sessionActive: session.isActive
    });
    
    // Handle completed sessions (full duration)
    if (sessionCompleted) {
      const minutesStudied = Math.floor(session.duration / 60);
      user.sessionsCompleted += 1;
      user.totalTimeStudied += minutesStudied;
      
      // Update the last completed session to prevent duplicates
      user.lastCompletedSession = {
        sessionId: sessionId,
        completedAt: new Date()
      };
      
      console.log(`Added ${minutesStudied} minutes for completed session`);
      await user.save();
      return;
    }
    
    // Handle custom duration (when user exits early with specific time)
    if (customDuration && customDuration > 0) {
      const minutesStudied = Math.floor(customDuration / 60);
      if (minutesStudied > 0) {
        user.sessionsCompleted += 1;
        user.totalTimeStudied += minutesStudied;
        
        // Update the last completed session to prevent duplicates
        user.lastCompletedSession = {
          sessionId: sessionId,
          completedAt: new Date()
        };
        
        console.log(`Added ${minutesStudied} minutes for partial session`);
        await user.save();
      }
      return;
    }
    
    // Handle timed sessions (calculate actual time spent)
    if (session.isActive && session.startTime) {
      const startTime = new Date(session.startTime);
      const now = new Date();
      const endTime = new Date(startTime.getTime() + session.duration * 1000);
      
      const actualEndTime = now > endTime ? endTime : now;
      const timeSpentSeconds = Math.floor((actualEndTime - startTime) / 1000);
      
      const minutesStudied = Math.floor(timeSpentSeconds / 60);
      if (minutesStudied > 0) {
        user.sessionsCompleted += 1;
        user.totalTimeStudied += minutesStudied;
        
        // Update the last completed session to prevent duplicates
        user.lastCompletedSession = {
          sessionId: sessionId,
          completedAt: new Date()
        };
        
        console.log(`Added ${minutesStudied} minutes for timed session`);
        await user.save();
      }
    }
  } catch (error) {
    console.error('Error updating session stats:', error);
  }
};