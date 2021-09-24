import { tagsUser, stripTagDecorations, discordIdTest } from '../../mentionFilter';
import minecraftServer from '../rcon';

const invalidUsernameChars = new RegExp(/[^a-zA-Z0-9_]/g);

/** Returns `true` if the username is a valid Minecraft username (case insensitive), `false` otherwise. */
export function isValidUsername(username: string): boolean {
    if (username.length < 3 || username.length > 16) return false;
    if (invalidUsernameChars.test(username)) return false;
    return true;
}

/** Returns an array of 2 items, the first representing whether the inputted Minecraft username exists and can be whitelist, the second representing the case-sensitive Minecraft username on `true`, or the error message on `false`. */
export async function getActualUsername(username: string): Promise<[boolean, string]> {
    try {
        const tryAdd = await minecraftServer.executeCommand(`whitelist add ${username}`);

        switch (tryAdd) {
            case 'Player is already whitelisted':
            case 'That player does not exist':
            case 'Not connected':
            case 'ERROR':
                return [false, tryAdd];
        }

        const actualUsername = tryAdd.split(' ')[1];
        // e.g. "whitelist add nAcHoToAst" -> "Added NachoToast to the whitelist"

        const nowRemove = await minecraftServer.executeCommand(`whitelist remove ${username}`);

        switch (nowRemove) {
            case 'Player is not whitelisted':
            case 'That player does not exist':
            case 'Not connected':
            case 'ERROR':
                return [false, `FATAL: ${nowRemove}`];
        }

        return [true, actualUsername];
    } catch (error) {
        console.log(error);
        return [false, 'ERROR'];
    }
}

export type SearchTypes = 'discord' | 'minecraft' | 'invalid';

/** Figures out if the input string is a Minecraft username, Discord ID, or none, and returns an array with the `searchType` and `searchTerm` respectively. */
export function searchTypeAndTerm(minecraftOrDiscord: string): [SearchTypes, string] {
    if (tagsUser.test(minecraftOrDiscord) || discordIdTest.test(minecraftOrDiscord)) {
        return ['discord', stripTagDecorations(minecraftOrDiscord)];
    } else if (isValidUsername(minecraftOrDiscord)) {
        return ['minecraft', minecraftOrDiscord];
    }
    return ['invalid', ''];
}
