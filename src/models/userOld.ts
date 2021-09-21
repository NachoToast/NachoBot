import mongoose from 'mongoose';
import { ObjectId } from 'mongoose';

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

export interface Application {
    status: string;
    _id: ObjectId;
    minecraft: string;
    discord: string;
    applied: Date;
}
