import { Message } from 'discord.js';
import { Command, DiscordClient } from '../../../../interfaces/Command';
import { WhitelistValidator } from '../helpers/validation';
import { DENIED_MESSAGES } from '../constants/messages';
import { createNotification } from '../helpers/notification';
import { getComment } from '../helpers/flags';

class Suspend implements Command {
    public name = 'suspend';
    public aliases = ['sus'];

    public adminOnly = false;
    public description = 'Returns application suspension status';
    public extendedDescription = `Will query unless **on** or **off** arguments are specified. Suspending applications stops new applications being made, and current applications from being accepted, rejected, removed, and cleared.`;

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
        if (!args.length) {
            message.channel.send(WhitelistValidator.message());
            return;
        }

        if (!isAdmin) {
            DENIED_MESSAGES.NO_PERMISSION(message);
            return;
        }

        const comment = getComment(message, args.slice(1), isAdmin, undefined);
        if (comment === false) return;

        if (args[0].toLowerCase() === 'on') {
            if (!WhitelistValidator.applicationsOpen) {
                message.channel.send(`Applications are already suspended.`);
                return;
            }
            WhitelistValidator.applicationsOpen = false;
        } else if (args[0].toLowerCase() === 'off') {
            if (WhitelistValidator.applicationsOpen) {
                message.channel.send(`Applications are already open.`);
                return;
            }
            WhitelistValidator.applicationsOpen = true;
        } else {
            DENIED_MESSAGES.UNRECOGNIZED_SUSPEND_ARG(message, args[0]);
            return;
        }

        createNotification(client, 'suspend', null, message.author.id, comment);
    }
}

export const suspend = new Suspend();
