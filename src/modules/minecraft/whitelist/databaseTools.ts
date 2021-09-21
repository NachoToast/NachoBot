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

// makes a new whitelist application
export async function makeNewApplication(minecraft: string, discord: string, comment: string = 'Initial application') {
    try {
        const timestamp = new Date().toISOString();

        const initialLog: UserLogAction = {
            doneBy: discord,
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

export async function removeEntry(discord: string, status: Statuses) {
    try {
        const removedUser: User = await UserModel.findOneAndDelete({ discord, status });
        return removedUser;
    } catch (error) {
        console.log(error);
        return;
    }
}

export async function searchApplications(status: Statuses, page: number = 1) {
    try {
        // default 20 per page
        const perPage = 20;
        const startIndex = (page - 1) * perPage;
        const total: number = await UserModel.countDocuments({});

        const applications: User[] = await UserModel.find({ status }).sort({ applied: 'asc' }).limit(perPage).skip(startIndex);

        if (!!applications.length) return { applications, total };
        return null;
    } catch (error) {
        console.log(error);
        return undefined;
    }
}
