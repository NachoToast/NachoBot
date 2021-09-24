import { Message } from 'discord.js';
import { Command } from '../../../../interfaces/Command';
import { clearApplication } from '../../../../modules/minecraft/whitelist/databaseTools';
import { searchTypeAndTerm } from '../../../../modules/minecraft/whitelist/username';
import { WhitelistValidator } from '../../../../modules/minecraft/whitelist/validation';
import { WhitelistError } from '../constants/database';
import DENIED_MESSAGES from '../constants/deniedMessages';

class Clear implements Command {
    public name = 'clear';
    public aliases = ['c'];

    public async execute({ args, isAdmin, message }: { args: string[]; isAdmin: boolean; message: Message }) {
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

        if (!WhitelistValidator.applicationsOpen) {
            message.channel.send(WhitelistValidator.message());
            return;
        }

        const clearedUser = await clearApplication(searchTerm);

        if (clearedUser instanceof WhitelistError) {
            message.channel.send(clearedUser.message);
            return;
        }

        if (!clearedUser) {
            DENIED_MESSAGES.NOT_FOUND(message, searchType, searchTerm, undefined);
            return;
        }

        message.channel.send(
            `Successfully cleared <@${clearedUser.discord}>'s application, linked to Minecraft user '${clearedUser?.minecraft}'`
        );
    }
}

export const clear = new Clear();
