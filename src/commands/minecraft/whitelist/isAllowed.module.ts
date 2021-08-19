import { Message } from 'discord.js';
import { modules } from '../../../config.json';

const allowedServerRoles: {
    [index: string]: string;
} = modules.minecraft.whitelist.adminRoles;

function isAllowed(message: Message): boolean {
    return message?.member?.roles?.cache.map((e) => e.id).includes(allowedServerRoles[message?.member?.guild?.id]) ?? false;
}

export default isAllowed;
