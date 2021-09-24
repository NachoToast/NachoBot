import { WhitelistError, maxApplicationsPerPage } from '../../../commands/minecraft/whitelist/constants/database';
import DEFAULT_LOG_COMMENTS from '../../../commands/minecraft/whitelist/constants/logComments';
import { Statuses, User, UserLogAction, UserModel } from '../../../models/user';

export type dbFnReturn = Promise<User | null | WhitelistError>;

/** Gets a single database entry by Minecraft username or Discord ID. */
export async function getSingleDBUser(discordOrMinecraft: string, status?: Statuses): dbFnReturn {
    try {
        let foundUser: User;
        if (!status) {
            foundUser = await UserModel.findOne({
                $or: [{ minecraftLowercase: discordOrMinecraft.toLowerCase() }, { discord: discordOrMinecraft }],
            });
        } else {
            foundUser = await UserModel.findOne({
                $or: [{ minecraftLowercase: discordOrMinecraft.toLowerCase() }, { discord: discordOrMinecraft }],
                status,
            });
        }
        return foundUser ?? null;
    } catch (error) {
        console.log(error);
        return new WhitelistError('databaseRead', error);
    }
}

/** Makes a log object out of a status change (with a relevant default comment if not specified). */
export function makeLogItem(doneBy: string, statusChangedTo: Statuses, comment?: string): UserLogAction {
    return {
        doneBy,
        statusChangedTo,
        timestamp: new Date().toISOString(),
        comment: comment || DEFAULT_LOG_COMMENTS[statusChangedTo],
    };
}

/** Updates an exising entry. */
export async function updateApplicationStatus(
    discordOrMinecraft: string,
    logAddition: UserLogAction,
    setStatus: Statuses,
    searchStatus?: Statuses
): dbFnReturn {
    try {
        const userToUpdate = await getSingleDBUser(discordOrMinecraft, searchStatus);
        if (userToUpdate === null || userToUpdate instanceof WhitelistError) return userToUpdate;

        userToUpdate.log.push(logAddition);
        userToUpdate.status = setStatus;

        const updatedUser = await UserModel.findOneAndUpdate({ discord: userToUpdate.discord }, userToUpdate, { new: true });
        return updatedUser;
    } catch (error) {
        console.log(error);
        return new WhitelistError('databaseBoth', error);
    }
}

/** Makes a new database entry and accompanying log. */
export async function makeNewApplication(
    minecraft: string,
    discord: string,
    doneBy?: string,
    comment?: string
): Promise<User | WhitelistError> {
    try {
        const newLog = makeLogItem(doneBy || discord, 'pending', comment);
        const newUser: User = {
            minecraftLowercase: minecraft.toLowerCase(),
            minecraft,
            discord,
            applied: new Date().toISOString(),
            status: 'pending',
            log: [newLog],
        };

        await UserModel.create(newUser);
        return newUser;
    } catch (error) {
        console.log(error);
        return new WhitelistError('databaseWrite', error);
    }
}

/** Removes a database entry. */
export async function clearApplication(discordOrMinecraft: string, status?: Statuses): dbFnReturn {
    try {
        let removedUser: User;
        if (!!status) {
            removedUser = await UserModel.findOneAndDelete({
                $or: [{ discord: discordOrMinecraft }, { minecraftLowercase: discordOrMinecraft.toLowerCase() }],
                status,
            });
        } else {
            removedUser = await UserModel.findOneAndDelete({
                $or: [{ discord: discordOrMinecraft }, { minecraftLowercase: discordOrMinecraft.toLowerCase() }],
            });
        }
        return removedUser ?? null;
    } catch (error) {
        console.log(error);
        return new WhitelistError('databaseWrite', error);
    }
}

export interface WhitelistSearchResults {
    applications: User[];
    total: number;
}
/** Searches database entries, optionally by status and with page offset. */
export async function searchApplications({
    status,
    page,
}: {
    status: Statuses | undefined;
    page: number | undefined;
}): Promise<WhitelistError | WhitelistSearchResults> {
    try {
        // default 20 per page
        const startIndex = ((page ?? 1) - 1) * maxApplicationsPerPage;
        let total: number;
        if (!!status) total = await UserModel.countDocuments({ status });
        else total = await UserModel.countDocuments();

        let applications: User[];
        if (!!status) {
            applications = await UserModel.find({ status })
                .sort({ applied: 'asc' })
                .limit(maxApplicationsPerPage)
                .skip(startIndex);
        } else {
            applications = await UserModel.find().sort({ applied: 'asc' }).limit(maxApplicationsPerPage).skip(startIndex);
        }

        return { applications, total };
    } catch (error) {
        console.log(error);
        return new WhitelistError('databaseRead', error);
    }
}
