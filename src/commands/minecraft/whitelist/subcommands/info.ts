import { Message, TextChannel } from 'discord.js';
import { Command } from '../../../../interfaces/Command';
import { getSingleDBUser } from '../helpers/databaseTools';
import { applicationInfoEmbed } from '../helpers/embedConstructors';
import { searchTypeAndTerm } from '../helpers/username';
import { WhitelistError } from '../constants/database';
import { DENIED_MESSAGES, OUTPUT_MESSAGES } from '../constants/messages';

class Info implements Command {
    public name = 'info';
    public aliases = ['i'];

    public adminOnly = true;
    public description =
        'Shows all information about an application/user. If none is specified will show info about your own request.';

    public async execute({ args, isAdmin, message }: { args: string[]; isAdmin: boolean; message: Message }) {
        if (!isAdmin) {
            DENIED_MESSAGES.NO_PERMISSION(message);
            return;
        }

        const [searchType, searchTerm] = searchTypeAndTerm(args[0] ?? message.author.id);

        if (searchType === 'invalid') {
            DENIED_MESSAGES.INVALID_EITHER(message, args[0] ?? message.author.id);
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

        message.channel.send({ embeds: [applicationInfoEmbed(message.channel as TextChannel, existingUser, false)] });
    }
}

export const info = new Info();
