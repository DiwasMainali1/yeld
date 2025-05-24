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
    const session = await Session.findOne({
      $or: [
        { creator: req.user._id },
        { participants: req.user._id }
      ]
    });
    
    if (!session) {
      return res.json({ session: null });
    }
    
    if (session.isExpired) {
      if (session.isActive && session.startTime) {
        const startTime = new Date(session.startTime);
        const endTime = new Date(startTime.getTime() + session.duration * 1000);
        
        if (new Date() >= endTime) {
          await updateSessionStats(req.user._id, session, true);
        }
      }
      
      await Session.deleteOne({ _id: session._id });
      return res.json({ session: null });
    }
    
    const creator = await User.findById(session.creator).select('username avatar');
    const creatorUsername = creator ? creator.username : 'Unknown User';
    const creatorAvatar = creator ? (creator.avatar || 'fox') : 'fox';
    
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
    
    if (session.isExpired) {
      await Session.deleteOne({ _id: session._id });
      return res.status(400).json({ message: 'Session has expired' });
    }
    
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
    
    const creator = await User.findById(session.creator).select('username avatar');
    const creatorUsername = creator ? creator.username : 'Unknown User';
    const creatorAvatar = creator ? (creator.avatar || 'fox') : 'fox';
    
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
    
    if (!session.participants.includes(req.user._id)) {
      session.participants.push(req.user._id);
      await session.save();
      
      participantUsernames[req.user._id.toString()] = req.user.username;
      participantAvatars[req.user._id.toString()] = req.user.avatar || 'fox';
    }
    
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
    
    if (!session.creator.equals(req.user._id)) {
      return res.status(403).json({ message: 'Only the creator can start the session' });
    }
    
    if (session.isActive) {
      return res.status(400).json({ message: 'Session is already active' });
    }
    
    if (session.isExpired) {
      await Session.deleteOne({ _id: session._id });
      return res.status(400).json({ message: 'Session has expired' });
    }
    
    const serverTime = new Date();
    session.isActive = true;
    session.startTime = serverTime;
    
    const serverEndTime = new Date(serverTime.getTime() + session.duration * 1000);
    session.expiresAt = serverEndTime;
    
    await session.save();
    
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
    
    const isUserInSession = session.creator.equals(req.user._id) || 
                          session.participants.some(id => id.equals(req.user._id));
    
    if (!isUserInSession) {
      return res.status(403).json({ message: 'You are not part of this session' });
    }
    
    if (session.isActive && session.startTime) {
      const now = new Date();
      const sessionEndTime = new Date(session.expiresAt);
      
      if (now < sessionEndTime) {
        const timeSpent = Math.floor((now - new Date(session.startTime)) / 1000);
        const minimumTime = 5 * 60;
        
        if (timeSpent >= minimumTime) {
          const minutesStudied = Math.floor(timeSpent / 60);
          const user = await User.findById(req.user._id);
          
          const sessionId = session._id.toString();
          if (!user.lastCompletedSession || 
              user.lastCompletedSession.sessionId !== sessionId) {
            
            user.sessionsCompleted += 1;
            user.totalTimeStudied += minutesStudied;
            user.lastCompletedSession = {
              sessionId: sessionId,
              completedAt: new Date()
            };
            
            await user.save();
          }
        }
      }
    }
    
    if (session.creator.equals(req.user._id)) {
      await Session.deleteOne({ _id: session._id });
      return res.json({ message: 'Session deleted successfully' });
    } else {
      session.participants = session.participants.filter(id => !id.equals(req.user._id));
      await session.save();
      return res.json({ message: 'Left session successfully' });
    }
    
  } catch (error) {
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
    
    if (!session.isActive || !session.startTime) {
      return res.status(400).json({ message: 'Invalid session state' });
    }
    
    const isUserInSession = session.creator.equals(req.user._id) || 
                          session.participants.some(id => id.equals(req.user._id));
    
    if (!isUserInSession) {
      return res.status(403).json({ message: 'You are not part of this session' });
    }
    
    const now = new Date();
    const sessionEndTime = new Date(session.expiresAt);
    
    const timeDifference = now.getTime() - sessionEndTime.getTime();
    const allowedVariance = 60 * 1000;
    
    if (Math.abs(timeDifference) <= allowedVariance) {
      await updateSessionStats(req.user._id, session, true);
      
      const user = await User.findById(req.user._id);
      
      const allParticipants = [session.creator, ...session.participants];
      let allCompleted = true;
      
      for (const participantId of allParticipants) {
        const participant = await User.findById(participantId);
        if (participant && 
            (!participant.lastCompletedSession || 
             participant.lastCompletedSession.sessionId !== session._id.toString())) {
          allCompleted = false;
          break;
        }
      }
      
      if (allCompleted) {
        await Session.deleteOne({ _id: session._id });
      }
      
      res.json({
        message: 'Session completed successfully',
        stats: {
          sessionsCompleted: user.sessionsCompleted,
          totalTimeStudied: user.totalTimeStudied
        }
      });
    } else {
      const remainingSeconds = Math.ceil((sessionEndTime.getTime() - now.getTime()) / 1000);
      if (remainingSeconds > 0) {
        res.status(400).json({ 
          message: `Session has ${remainingSeconds} seconds remaining` 
        });
      } else {
        res.status(400).json({ 
          message: `Session ended ${Math.abs(remainingSeconds)} seconds ago` 
        });
      }
    }
  } catch (error) {
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
    
    if (session.isExpired) {
      if (session.isActive && session.startTime) {
        const startTime = new Date(session.startTime);
        const endTime = new Date(startTime.getTime() + session.duration * 1000);
        
        if (new Date() >= endTime) {
          const allParticipants = [session.creator, ...session.participants];
          
          for (const participantId of allParticipants) {
            await updateSessionStats(participantId, session, true);
          }
        }
      }
      
      await Session.deleteOne({ _id: session._id });
      
      return res.json({ 
        expired: true,
        message: 'Session has expired and been cleaned up'
      });
    }

    if (session.isActive && session.startTime) {
      const startTime = new Date(session.startTime);
      const endTime = new Date(startTime.getTime() + session.duration * 1000);
      const now = new Date();
      
      if (now >= endTime) {
        return res.json({ 
          participants: session.participants,
          participantUsernames: {},
          participantAvatars: {},
          creatorUsername: '',
          creatorAvatar: 'fox',
          creator: session.creator,
          isActive: session.isActive,
          startTime: session.startTime,
          expiresAt: session.expiresAt,
          serverTime: new Date(),
          expired: false,
          naturallyCompleted: true
        });
      }
    }

    const creator = await User.findById(session.creator).select('username avatar');
    const creatorUsername = creator ? creator.username : 'Unknown User';
    const creatorAvatar = creator ? (creator.avatar || 'fox') : 'fox';
    
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
    res.status(400).json({ message: error.message });
  }
};

const updateSessionStats = async (userId, session, sessionCompleted = false) => {
  try {
    if (!session.isActive || !session.startTime) {
      return;
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return;
    }
    
    const sessionId = session._id.toString();
    
    if (user.lastCompletedSession && 
        user.lastCompletedSession.sessionId === sessionId &&
        (Date.now() - user.lastCompletedSession.completedAt) < 5 * 60 * 1000) {
      return;
    }
    
    if (sessionCompleted) {
      const minutesStudied = Math.floor(session.duration / 60);
      user.sessionsCompleted += 1;
      user.totalTimeStudied += minutesStudied;
      
      user.lastCompletedSession = {
        sessionId: sessionId,
        completedAt: new Date()
      };
      
      await user.save();
    }
  } catch (error) {
    console.error('Error updating session stats:', error);
  }
};

const cleanupExpiredSessions = async () => {
  try {
    const expiredSessions = await Session.find({
      isActive: true,
      expiresAt: { $lte: new Date() }
    });

    for (const session of expiredSessions) {
      const allParticipants = [session.creator, ...session.participants];
      
      for (const participantId of allParticipants) {
        await updateSessionStats(participantId, session, true);
      }
      
      await Session.deleteOne({ _id: session._id });
    }
  } catch (error) {
    console.error('Error in cleanup job:', error);
  }
};

setInterval(cleanupExpiredSessions, 30000);