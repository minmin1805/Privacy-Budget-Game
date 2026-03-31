import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    sessionId: {
        type: String,
        required: true,
        unique: true,
    },
    score: {
        type: Number,
        default: 0,
    },
    correctDecisions: {
        type: Number,
        default: 0,
    },
    badge: {
        type: String,
        default: '',
        trim: true,

    },
    completeAt: {
        type: Date,
        default: null,
    }
}, {timestamps: true});

const Player = mongoose.model('Player', playerSchema);

export default Player;