import minecraftServer from '../rcon.module';
const invalidUsernameChars = new RegExp(/[^a-zA-Z0-9_]/, 'g');

// makes sure input username matches minecraft username syntax
export const isValidUsername = (username: any) => {
    if (typeof username !== 'string') return false;
    if (username.length < 3 || username.length > 16) return false;
    if (invalidUsernameChars.test(username)) return false;
    return true;
};

// makes sure username isn't already whitelisted, and is a registered username
export const verifiedUsername = async (username: string): Promise<[success: boolean, output: string]> => {
    const tryAdd = await minecraftServer.executeCommand(`whitelist add ${username}`);

    switch (tryAdd) {
        case 'Player is already whitelisted':
        case 'That player does not exist':
        case 'Not connected':
            return [false, tryAdd];
    }

    const actualUsername = tryAdd.split(' ')[1];

    const nowRemove = await minecraftServer.executeCommand(`whitelist remove ${username}`);
    switch (nowRemove) {
        case 'Player is not whitelisted':
        case 'That player does not exist':
        case 'Not connected':
            return [false, `FATAL: ${nowRemove}`];
        default:
            return [true, actualUsername];
    }
};
