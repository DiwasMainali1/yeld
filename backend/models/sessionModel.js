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

sessionSchema.methods.addParticipant = function(userId) {
  // Check if session is full
  if (this.participants.length >= 10) {
    return false;
  }
  
  // Check if user is already in participants list
  const isAlreadyParticipant = this.participants.some(id => id.equals(userId));
  
  // Check if user is the creator
  const isCreator = this.creator.equals(userId);
  
  // Only add if not already a participant and not the creator
  if (!isAlreadyParticipant && !isCreator) {
    this.participants.push(userId);
    return true;
  }
  
  return false;
};

// Add method to remove a participant
sessionSchema.methods.removeParticipant = function(userId) {
  // Check if user is the creator
  if (this.creator.equals(userId)) {
    return 'delete'; // Signal that session should be deleted
  }
  
  // Check if user is in participants list
  const initialLength = this.participants.length;
  
  // Filter out the participant
  this.participants = this.participants.filter(id => !id.equals(userId));
  
  // Return true if participant was removed
  return this.participants.length < initialLength;
};

const Session = mongoose.model('Session', sessionSchema);
export default Session;