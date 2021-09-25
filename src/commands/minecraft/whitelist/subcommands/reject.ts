import { Message } from 'discord.js';
import { Command, DiscordClient } from '../../../../interfaces/Command';
import { makeLogItem, updateApplicationStatus } from '../helpers/databaseTools';
import { searchTypeAndTerm } from '../helpers/username';
import { WhitelistError } from '../constants/database';
import { DENIED_MESSAGES, OUTPUT_MESSAGES } from '../constants/messages';
import { WhitelistValidator } from '../helpers/validation';
import { getComment } from '../helpers/flags';
import { createNotification } from '../helpers/notification';
class Reject implements Command {
    public name = 'reject';

    public adminOnly = true;
    public description = 'Rejects an application.';

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

        if (!args.length) {
            DENIED_MESSAGES.NOT_SPECIFIED_USER(message);
            return;
        }

        const [searchType, searchTerm] = searchTypeAndTerm(args[0]);

        if (searchType === 'invalid') {
            DENIED_MESSAGES.INVALID_EITHER(message, args[0]);
            return;
        }

        const comment = getComment(message, args, isAdmin, undefined);
        if (comment === false) return;

        const newUserLog = makeLogItem(message.author.id, 'rejected', comment);

        const rejectedUser = await updateApplicationStatus(searchTerm, newUserLog, 'rejected', 'pending');

        if (rejectedUser instanceof WhitelistError) {
            message.channel.send(rejectedUser.message);
            return;
        }

        if (!rejectedUser) {
            OUTPUT_MESSAGES.NOT_FOUND(message, searchType, searchTerm, 'pending');
            return;
        }

        OUTPUT_MESSAGES.REJECTED_REQUEST(message);

        createNotification(client, 'rejected', rejectedUser, message.author.id, comment);
    }
}

export const reject = new Reject();
