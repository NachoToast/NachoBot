import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    minecraft: {
        type: String,
        required: true,
    },
    discord: {
        type: String,
        required: true,
    },
    applied: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        default: 'pending',
    },
});

export default mongoose.model('whitelistApplications', userSchema);
