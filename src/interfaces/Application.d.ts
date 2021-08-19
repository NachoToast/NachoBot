import { ObjectId } from 'mongoose';

export default interface Application {
    status: string;
    _id: ObjectId;
    minecraft: string;
    discord: string;
    applied: Date;
}
