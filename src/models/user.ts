import mongoose from 'mongoose';
import { devMode } from '../config.json';

/**
* `pending` - default status upon application

* `accepted` [accept] - user is on whitelist

* `rejected` [reject] - rejected by an admin

* `frozen` [freeze] - temporarily on hold for external checks/vetting (should unwhitelist if updated to this)

* `banned` [ban] - user was banned

* `vacant` [clear | remove] - slot was taken but is now free // NOT YET IMPLEMENTED OR SUPPORTED
*/
export const userStatuses: Statuses[] = ['pending', 'accepted', 'rejected', 'frozen', 'banned'];
export type Statuses = 'pending' | 'accepted' | 'rejected' | 'frozen' | 'banned';

export const statusDescriptions: { [key in Statuses]: string } = {
    accepted: 'Added onto the whitelist.',
    banned: 'Removed from the whitelist.',
    frozen: 'Temporarily removed from whitelist and awaiting further review.',
    pending: 'Awaiting admin review.',
    rejected: 'Rejected by an admin.',
};

export interface UserLogAction {
    doneBy: string; // discord ID (can be bot)
    statusChangedTo: Statuses;
    timestamp: string; // ISO string
    comment: string; // justification if necessary
}

export interface User {
    minecraftLowercase: string; // for searching purposes
    minecraft: string; // case preserved
    discord: string;
    applied: string; // ISO string
    status: Statuses;
    log: UserLogAction[];
}

export const userSchema = new mongoose.Schema({
    minecraft: {
        type: String,
        required: true,
    },
    minecraftLowercase: {
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
    log: {
        type: {
            doneBy: String,
            statusChangedTo: String,
            timestamp: Date,
            comment: String,
        },
        default: [],
    },
});

const dbName = devMode ? 'player_v2_dev' : 'player_v2';

export const UserModel = mongoose.model(dbName, userSchema);
