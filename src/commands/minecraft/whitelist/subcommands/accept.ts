import { Message, TextChannel } from 'discord.js';
import { Command, DiscordClient } from '../../../../interfaces/Command';
import { makeLogItem, updateApplicationStatus } from '../../../../modules/minecraft/whitelist/databaseTools';
import { searchTypeAndTerm } from '../../../../modules/minecraft/whitelist/username';
import { WhitelistError } from '../constants/database';
import { devMode, modules } from '../../../../config.json';
import DENIED_MESSAGES from '../constants/deniedMessages';
import moment from 'moment';
import minecraftServer from '../../../../modules/minecraft/rcon';
import { WhitelistValidator } from '../../../../modules/minecraft/whitelist/validation';

const notifyAccepted = modules.minecraft.whitelist.sendAcceptedApplications;
const feedChannel = devMode
    ? modules.minecraft.whitelist.acceptedRequestFeedChannelDev
    : modules.minecraft.whitelist.acceptedRequestFeedChannel;

class Accept implements Command {
    public name = 'accept';
    public aliases = ['a'];

    private reasonFlag = 'r';

    public async execute({
        args,
        client,
        isAdmin,
        message,
    }: {
        args: string[];
        client: DiscordClient;
        isAdmin: boolean;
        message: Message;
    }) {
        if (!isAdmin) {
            DENIED_MESSAGES.NO_PERMISSION(message);
            return;
        }

        if (!WhitelistValidator.applicationsOpen) {
            message.channel.send(WhitelistValidator.message());
            return;
        }
        args.splice(0, 1);

        if (!args.length) {
            DENIED_MESSAGES.NOT_SPECIFIED_USER(message);
            return;
        }

        const [searchType, searchTerm] = searchTypeAndTerm(args[0]);

        if (searchType === 'invalid') {
            DENIED_MESSAGES.INVALID_EITHER(message, args[0]);
            return;
        }

        const reason = this.getReason(message, args);
        if (reason === false) return;

        const newUserLog = makeLogItem(message.author.id, 'accepted', reason);

        const acceptedUser = await updateApplicationStatus(searchTerm, newUserLog, 'accepted', 'pending');

        if (acceptedUser instanceof WhitelistError) {
            message.channel.send(acceptedUser.message);
            return;
        }

        if (!acceptedUser) {
            DENIED_MESSAGES.NOT_FOUND(message, searchType, searchTerm, 'pending');
            return;
        }

        const doWhitelist = await minecraftServer.executeCommand(`whitelist add ${acceptedUser.minecraft}`);
        switch (doWhitelist) {
            case 'ERROR':
            case 'Not connected':
            case 'That player does not exist':
                message.channel.send(`${doWhitelist}, this should never happen, please contact <@240312568273436674>`);
                break;
            case 'Player is already whitelisted':
                message.channel.send(`Player was already whitelisted.`);
                break;
            default:
                message.react('✅');
        }

        if (notifyAccepted) {
            const outputChannel = client.channels.cache.get(feedChannel) as TextChannel | undefined;

            if (!!outputChannel) {
                // TODO: move this to its own module, and message constant for this
                message.channel.send(
                    `${acceptedUser.minecraft} (<@${acceptedUser.discord}>) has been added to the whitelist by <@${
                        message.author.id
                    }> after ${moment(acceptedUser.applied).fromNow(true)}.`
                );
            }
        }
    }

    /** Gets the reason specified if applicable, or `false` if invalid. */
    private getReason(message: Message, args: string[]) {
        const attemptedReason = args.indexOf(this.reasonFlag) + 1;
        if (!attemptedReason) return;
        if (!args[attemptedReason]) {
            DENIED_MESSAGES.NOT_SPECIFIED_REASON(message);
            return false;
        }

        return args.slice(attemptedReason).join(' ');
    }
}

export const accept = new Accept();
// TODO: allow accepting of any account status, not just pending
