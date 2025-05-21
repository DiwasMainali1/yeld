import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  duration: {
    type: Number,
    required: true,
    default: 1500 // Default 25 minutes in seconds
  },
  startTime: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Sessions expire after 24 hours by default if not started
      return new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
  }
}, {
  timestamps: true
});

// Only allow up to 10 participants
sessionSchema.path('participants').validate(function(value) {
  return value.length <= 10;
}, 'A session can have a maximum of 10 participants');

// Create index to automatically expire sessions
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Add isExpired virtual property
sessionSchema.virtual('isExpired').get(function() {
  if (this.isActive && this.startTime) {
    // If session is active, check if it has exceeded its duration
    const endTime = new Date(this.startTime.getTime() + this.duration * 1000);
    return new Date() > endTime;
  }
  return new Date() > this.expiresAt;
});

// Add method to check if the session is full
sessionSchema.methods.isFull = function() {
  return this.participants.length >= 10;
};

// Add method to add a participant
sessionSchema.methods.addParticipant = function(userId) {
  if (this.isFull()) {
    throw new Error('Session is full');
  }
  
  // Check if user is already in the session
  if (this.participants.includes(userId) || this.creator.equals(userId)) {
    return false;
  }
  
  this.participants.push(userId);
  return true;
};

// Add method to remove a participant
sessionSchema.methods.removeParticipant = function(userId) {
  const initialLength = this.participants.length;
  this.participants = this.participants.filter(id => !id.equals(userId));
  
  // If creator is leaving, delete the session
  if (this.creator.equals(userId)) {
    return 'delete';
  }
  
  // Return true if participant was removed
  return this.participants.length < initialLength;
};

const Session = mongoose.model('Session', sessionSchema);
export default Session;