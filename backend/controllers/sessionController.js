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
      participants: [], // Creator is not in participants array
      duration: duration
    });
    
    res.status(201).json({
      _id: session._id,
      duration: session.duration,
      participants: []
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
    
    // Check if session is expired
    if (session.isExpired) {
      // If it's expired, clean it up and return no session
      if (session.isActive && session.startTime) {
        // If the session was active AND has finished naturally, update user stats before deleting
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
    
    res.json({
      session: {
        _id: session._id,
        creator: session.creator,
        participants: session.participants,
        duration: session.duration,
        isActive: session.isActive,
        startTime: session.startTime
      },
      userId: req.user._id
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
    
    // If user is the creator, just return the session
    if (session.creator.equals(req.user._id)) {
      return res.json({
        _id: session._id,
        creator: session.creator,
        participants: session.participants,
        duration: session.duration,
        isActive: session.isActive,
        startTime: session.startTime
      });
    }
    
    // Add user to participants
    const added = session.addParticipant(req.user._id);
    
    if (added === false) {
      return res.status(400).json({ message: 'You are already in this session' });
    }
    
    await session.save();
    
    res.json({
      _id: session._id,
      creator: session.creator,
      participants: session.participants,
      duration: session.duration,
      isActive: session.isActive,
      startTime: session.startTime,
      userId: req.user._id
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
    
    // Update session
    session.isActive = true;
    session.startTime = new Date();
    
    // Update expiresAt to be startTime + duration
    session.expiresAt = new Date(session.startTime.getTime() + session.duration * 1000);
    
    await session.save();
    
    res.json({
      _id: session._id,
      isActive: session.isActive,
      startTime: session.startTime,
      expiresAt: session.expiresAt
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
    
    // Only update stats if session was active, has a startTime, and has completed naturally
    if (session.isActive && session.startTime) {
      const startTime = new Date(session.startTime);
      const sessionEndTime = new Date(startTime.getTime() + session.duration * 1000);
      
      // Only update stats if the session has reached its natural end time
      if (new Date() >= sessionEndTime) {
        await updateSessionStats(req.user._id, session, true);
      }
    }
    
    // Remove user from session
    const result = session.removeParticipant(req.user._id);
    
    // If creator is leaving, delete the session
    if (result === 'delete' || session.participants.length === 0) {
      await Session.deleteOne({ _id: session._id });
      return res.json({ message: 'Session deleted successfully' });
    }
    
    await session.save();
    
    res.json({ message: 'Left session successfully' });
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
    
    // Check if user is part of the session
    const isUserInSession = session.creator.equals(req.user._id) || 
                          session.participants.some(id => id.equals(req.user._id));
    
    if (!isUserInSession) {
      return res.status(403).json({ message: 'You are not part of this session' });
    }
    
    // Only update stats if session was active and has a startTime
    if (session.isActive && session.startTime) {
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
      return res.json({ 
        expired: true,
        participants: session.participants,
        isActive: session.isActive
      });
    }
    
    res.json({
      participants: session.participants,
      isActive: session.isActive,
      startTime: session.startTime,
      expiresAt: session.expiresAt
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Helper function to update user stats when session completes
const updateSessionStats = async (userId, session, sessionCompleted = false) => {
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
    
    // If sessionCompleted is true, it means the session ran to completion
    // In this case, award the full session duration
    if (sessionCompleted) {
      const minutesStudied = Math.floor(session.duration / 60);
      user.sessionsCompleted += 1;
      user.totalTimeStudied += minutesStudied;
      await user.save();
      return;
    }
    
    // Otherwise, calculate the actual time spent (this branch should not be used normally)
    console.warn('Warning: Calculating partial session time - this should not happen normally');
    const now = new Date();
    const startTime = new Date(session.startTime);
    const endTime = session.isExpired ? 
      new Date(startTime.getTime() + session.duration * 1000) : 
      now;
    
    const timeSpentSeconds = Math.min(
      Math.floor((endTime - startTime) / 1000),
      session.duration
    );
    
    // Convert to minutes and update user stats
    const minutesStudied = Math.floor(timeSpentSeconds / 60);
    if (minutesStudied > 0) {
      user.sessionsCompleted += 1;
      user.totalTimeStudied += minutesStudied;
      await user.save();
    }
  } catch (error) {
    console.error('Error updating session stats:', error);
  }
};