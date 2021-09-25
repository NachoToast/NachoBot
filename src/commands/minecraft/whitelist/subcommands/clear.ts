import { Message } from 'discord.js';
import { Command, DiscordClient } from '../../../../interfaces/Command';
import { clearApplication } from '../helpers/databaseTools';
import { searchTypeAndTerm } from '../helpers/username';
import { WhitelistValidator } from '../helpers/validation';
import { WhitelistError } from '../constants/database';
import { DENIED_MESSAGES, OUTPUT_MESSAGES } from '../constants/messages';
import { createNotification } from '../helpers/notification';
import { getComment } from '../helpers/flags';

class Clear implements Command {
    public name = 'clear';
    public aliases = ['c'];

    public adminOnly = true;
    public description = "Clears another user's application.";
    public extendedDescription = `To remove your own application, use the \`remove\` command. Unlike \`remove\`, this works for all applications, not just pending ones.`;

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

        if (!WhitelistValidator.applicationsOpen) {
            message.channel.send(WhitelistValidator.message());
            return;
        }

        const comment = getComment(message, args, isAdmin, undefined);
        if (comment === false) return;

        const clearedUser = await clearApplication(searchTerm);

        if (clearedUser instanceof WhitelistError) {
            message.channel.send(clearedUser.message);
            return;
        }

        if (!clearedUser) {
            OUTPUT_MESSAGES.NOT_FOUND(message, searchType, searchTerm, undefined);
            return;
        }

        OUTPUT_MESSAGES.CLEARED_REQUEST(message, clearedUser.discord, clearedUser.minecraft);

        createNotification(client, 'cleared', clearedUser, message.author.id, comment);
    }
}

export const clear = new Clear();
