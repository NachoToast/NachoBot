import { Statuses, User, UserLogAction, UserModel } from '../../../models/user';

// get single user based on discordID and optionally minecraft username
export async function getSingleDBUser(discord: string, minecraftUsername?: string): Promise<User | null | undefined> {
    try {
        let foundUser: User;
        if (!!minecraftUsername) {
            foundUser = await UserModel.findOne({ $or: [{ minecraftLowercase: minecraftUsername.toLowerCase() }, { discord }] });
        } else foundUser = await UserModel.findOne({ discord });
        return foundUser ?? null;
    } catch (error) {
        console.log(error);
        return undefined;
    }
}

// wip
const modificationMap: { [key in Statuses]: string } = {
    accepted: '',
    banned: '',
    frozen: '',
    pending: '',
    rejected: '',
    all: '',
};

export async function acceptApplication(
    accepteeDiscordOrMinecraft: string,
    accepterDiscord: string,
    comment: string | undefined
) {
    try {
        const userToAccept: User = await UserModel.findOne({
            $or: [{ discord: accepteeDiscordOrMinecraft }, { minecraftLowercase: accepteeDiscordOrMinecraft.toLowerCase() }],
            status: 'pending',
        });
        if (!userToAccept) {
            return null;
        }
        userToAccept.status = 'accepted';
        const newLogItem: UserLogAction = {
            doneBy: accepterDiscord,
            statusChangedTo: 'accepted',
            timestamp: new Date().toISOString(),
            comment: comment || 'Accepted their whitelist application',
        };
        userToAccept.log.push(newLogItem);

        const updatedUser: User = await UserModel.findOneAndUpdate({ discord: userToAccept.discord }, userToAccept, {
            new: true,
        });
        if (!updatedUser) return null;

        return updatedUser;
    } catch (error) {
        console.log(error);
        return;
    }
}

export async function rejectApplication(rejecteeDiscordOrMinecraft: string, rejecterDiscord: string, comment: string) {
    try {
        const userToReject: User = await UserModel.findOne({
            $or: [{ discord: rejecteeDiscordOrMinecraft }, { minecraftLowercase: rejecteeDiscordOrMinecraft.toLowerCase() }],
            status: 'pending',
        });
        if (!userToReject) {
            return null;
        }
        userToReject.status = 'rejected';
        const newLogItem: UserLogAction = {
            doneBy: rejecterDiscord,
            statusChangedTo: 'rejected',
            timestamp: new Date().toISOString(),
            comment,
        };
        userToReject.log.push(newLogItem);

        const updatedUser: User = await UserModel.findOneAndUpdate({ discord: userToReject.discord }, userToReject, {
            new: true,
        });
        if (!updatedUser) return null;

        return updatedUser;
    } catch (error) {
        console.log(error);
        return;
    }
}

// makes a new whitelist application
export async function makeNewApplication(
    minecraft: string,
    discord: string,
    comment: string = 'Initial application',
    doneBy: string | false
) {
    try {
        const timestamp = new Date().toISOString();

        const initialLog: UserLogAction = {
            doneBy: doneBy || discord,
            statusChangedTo: 'pending',
            timestamp,
            comment,
        };

        const newApplicant: User = {
            minecraft,
            minecraftLowercase: minecraft.toLowerCase(),
            discord,
            applied: timestamp,
            status: 'pending',
            log: [initialLog],
        };

        UserModel.create(newApplicant);

        return newApplicant;
    } catch (error) {
        console.log(error);
        // TODO: error log file
    }
}

// remove pending database entry by discord id
export async function removeEntry(discord: string, status: Statuses) {
    try {
        const removedUser: User = await UserModel.findOneAndDelete({ discord, status });
        return removedUser;
    } catch (error) {
        console.log(error);
        return;
    }
}

// returns up to 20 applications + page number info
export async function searchApplications(status: Statuses, page: number = 1) {
    try {
        // default 20 per page
        const perPage = 20;
        const startIndex = (page - 1) * perPage;
        const total: number = await UserModel.countDocuments({});

        let applications: User[];
        if (status === 'all') {
            applications = await UserModel.find().sort({ applied: 'asc' }).limit(perPage).skip(startIndex);
        } else {
            applications = await UserModel.find({ status }).sort({ applied: 'asc' }).limit(perPage).skip(startIndex);
        }

        if (!!applications.length) return { applications, total };
        return null;
    } catch (error) {
        console.log(error);
        return undefined;
    }
}
