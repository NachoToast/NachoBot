import { Message } from 'discord.js';
import { Command } from '../../../../interfaces/Command';
import { getSingleDBUser } from '../../../../modules/minecraft/whitelist/databaseTools';
import { applicationInfoEmbed } from '../../../../modules/minecraft/whitelist/embedConstructors';
import { searchTypeAndTerm } from '../../../../modules/minecraft/whitelist/username';
import { WhitelistError } from '../constants/database';
import DENIED_MESSAGES from '../constants/deniedMessages';

class Info implements Command {
    public name = 'info';
    public aliases = ['i'];

    public async execute({ args, isAdmin, message }: { args: string[]; isAdmin: boolean; message: Message }) {
        if (!isAdmin) {
            DENIED_MESSAGES.NO_PERMISSION(message);
            return;
        }
        args.splice(0, 1);

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
            DENIED_MESSAGES.NOT_FOUND(message, searchType, searchTerm, undefined);
            return;
        }

        message.channel.send({ embeds: [applicationInfoEmbed(message, existingUser)] });
    }
}

export const info = new Info();
