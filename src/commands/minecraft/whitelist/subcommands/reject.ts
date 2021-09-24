import { Message, TextChannel } from 'discord.js';
import { Command, DiscordClient } from '../../../../interfaces/Command';
import { makeLogItem, updateApplicationStatus } from '../../../../modules/minecraft/whitelist/databaseTools';
import { searchTypeAndTerm } from '../../../../modules/minecraft/whitelist/username';
import { WhitelistError } from '../constants/database';
import DENIED_MESSAGES from '../constants/deniedMessages';
import { devMode, modules } from '../../../../config.json';
import moment from 'moment';
import { WhitelistValidator } from '../../../../modules/minecraft/whitelist/validation';

const notifyRejected = modules.minecraft.whitelist.sendRejectedApplications;
const feedChannel = devMode
    ? modules.minecraft.whitelist.rejectedRequestFeedChannelDev
    : modules.minecraft.whitelist.rejectedRequestFeedChannel;

class Reject implements Command {
    public name = 'reject';

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

        const newUserLog = makeLogItem(message.author.id, 'rejected', reason);

        const rejectedUser = await updateApplicationStatus(searchTerm, newUserLog, 'rejected', 'pending');

        if (rejectedUser instanceof WhitelistError) {
            message.channel.send(rejectedUser.message);
            return;
        }

        if (!rejectedUser) {
            DENIED_MESSAGES.NOT_FOUND(message, searchType, searchTerm, 'pending');
            return;
        }

        message.react('✅');

        if (notifyRejected) {
            const outputChannel = client.channels.cache.get(feedChannel) as TextChannel | undefined;

            if (!!outputChannel) {
                // TODO: move this to its own module, and message constant for this
                message.channel.send(
                    `${rejectedUser.minecraft} (<@${rejectedUser.discord}>) has been rejected from the whitelist by <@${
                        message.author.id
                    }> after ${moment(rejectedUser.applied).fromNow(true)}.`
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

export const reject = new Reject();

// TODO: enforce commands for this
