import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        enum: ['fox', 'owl', 'panda', 'penguin', 'koala'],
        default: 'fox'
    },
    sessionsCompleted: {
        type: Number,
        default: 0
    },
    totalTimeStudied: {
        type: Number, 
        default: 0
    },
    usernameChanges: {
        type: Number,
        default: 0,
        max: 1 // Now limited to 1 change only
    },
    taskHistory: [{
        text: String,
        completedAt: { type: Date, default: Date.now },
        wasCompleted: { type: Boolean, default: false },
        wasDeleted: { type: Boolean, default: false }
    }],
    timerSettings: {
        pomodoro: { type: Number, default: 50 * 60 },     // 50 minutes
        shortBreak: { type: Number, default: 10 * 60 },   // 10 minutes
        longBreak: { type: Number, default: 60 * 60 }     // 1 hour
    },
    background: {
        type: String,
        default: 'default'
    },
    lastCompletedSession: {
        sessionId: String,
        completedAt: Date
    },
    petData: {
        hasHatched: {
            type: Boolean,
            default: false
        },
        unlockedPets: {
            type: [String],
            default: ['novice']
        },
        activePet: {
            type: String,
            default: null
        }
    }
}, {
    timestamps: true
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;