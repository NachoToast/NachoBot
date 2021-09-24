// discord user validation for admin commands & global whitelist suspension stuff
import { Message } from 'discord.js';
import { modules } from '../../../config.json';

export class WhitelistValidator {
    public static applicationsOpen: boolean = true;

    /** Returns appropriate message depending on application suspension status. */
    public static message() {
        if (this.applicationsOpen) {
            return `Whitelist applications are currently **open** ✅`;
        }
        return `Whitelist applications are currently **suspended** ❌`;
    }
}

const allowedServerRoles: { [index: string]: string } = modules.minecraft.whitelist.adminRoles;

/** Returns `true` if the message author is has an admin role for whitelist commands, otherwise `false`. */
export function isAllowed(message: Message) {
    return message?.member?.roles?.cache.map((e) => e.id).includes(allowedServerRoles[message?.member?.guild?.id]) ?? false;
}
