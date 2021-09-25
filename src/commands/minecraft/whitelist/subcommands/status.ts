import { Message } from 'discord.js';
import { Command } from '../../../../interfaces/Command';
import { getSingleDBUser } from '../helpers/databaseTools';
import { applicationStatusEmbed } from '../helpers/embedConstructors';
import { WhitelistError } from '../constants/database';
import { DENIED_MESSAGES, OUTPUT_MESSAGES } from '../constants/messages';
import { searchTypeAndTerm } from '../helpers/username';

class Status implements Command {
    public name = 'status';
    public aliases = ['s'];

    public adminOnly = false;
    public description = 'See your application.';
    public extendedDescription = `Shows the basic application info of the user specified, or your own application if nothing is specified.`;

    public async execute({ args, message }: { args: string[]; message: Message }) {
        const [searchType, searchTerm] = searchTypeAndTerm(args[0] ?? message.author.id);

        if (searchType === 'invalid') {
            DENIED_MESSAGES.INVALID_EITHER(message, args[0]);
            return;
        }

        const existingUser = await getSingleDBUser(searchTerm);

        if (existingUser instanceof WhitelistError) {
            message.channel.send(existingUser.message);
            return;
        }

        if (!existingUser) {
            if (searchTerm === message.author.id) {
                OUTPUT_MESSAGES.SELF_NOT_FOUND(message, undefined);
            } else {
                OUTPUT_MESSAGES.NOT_FOUND(message, searchType, searchTerm, undefined);
            }
            return;
        }

        message.channel.send({ embeds: [applicationStatusEmbed(message, existingUser)] });
    }
}

export const status = new Status();
