import { Message } from 'discord.js';
import { Command, DiscordClient } from '../../../../interfaces/Command';
import { clearApplication } from '../helpers/databaseTools';
import { isInServer, WhitelistValidator } from '../helpers/validation';
import { WhitelistError } from '../constants/database';
import { DENIED_MESSAGES, OUTPUT_MESSAGES } from '../constants/messages';
import { createNotification } from '../helpers/notification';

class Remove implements Command {
    public name = 'remove';
    public aliases = ['r'];

    public adminOnly = false;
    public description = 'Removes your application.';
    public extendedDescription = `Removes your own whitelist application, but only if it's pending.`;

    public async execute({ client, message }: { client: DiscordClient; message: Message }) {
        if (!isInServer(client, message.author.id)) {
            DENIED_MESSAGES.NOT_IN_SERVER(message);
            return;
        }

        if (!WhitelistValidator.applicationsOpen) {
            message.channel.send(WhitelistValidator.message());
            return;
        }

        const removedUser = await clearApplication(message.author.id, 'pending');

        if (removedUser instanceof WhitelistError) {
            message.channel.send(removedUser.message);
            return;
        }

        if (!removedUser) {
            OUTPUT_MESSAGES.SELF_NOT_FOUND(message, 'pending');
            return;
        }

        OUTPUT_MESSAGES.REMOVED_YOUR_REQUEST(message, removedUser.minecraft);

        createNotification(client, 'removed', removedUser, message.author.id, undefined);
    }
}

export const remove = new Remove();
