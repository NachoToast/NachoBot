import { Message } from 'discord.js';
import { modules } from '../../../config.json';

const allowedServerRoles: { [index: string]: string } = modules.minecraft.whitelist.adminRoles;

// makes sure user has appropriate role before using admin whitelist commands
export const isAllowed = (message: Message) => {
    return message?.member?.roles?.cache.map((e) => e.id).includes(allowedServerRoles[message?.member?.guild?.id]) ?? false;
};
