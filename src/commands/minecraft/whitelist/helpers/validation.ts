// discord user validation for admin commands & global whitelist suspension stuff
import { Message, TextChannel } from 'discord.js';
import { modules } from '../../../../config.json';
import { DiscordClient } from '../../../../interfaces/Command';
import { publicChannel } from './notification';

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

/** Returns `false` if the user is not in the same Discord server as the announcement channels. */
export function isInServer(client: DiscordClient, discordID: string) {
    const whitelistPublicChannel = client.channels.cache.get(publicChannel);
    if (!whitelistPublicChannel) {
        console.log(`Bot isn't in whitelist server?`);
        return false;
    }
    if (whitelistPublicChannel.type !== 'GUILD_TEXT') {
        console.log(`Whitelist channel (public) isn't guild text channel?`);
    }
    const userInGuild = (whitelistPublicChannel as TextChannel).guild.members.cache.get(discordID);
    return !!userInGuild;
}
