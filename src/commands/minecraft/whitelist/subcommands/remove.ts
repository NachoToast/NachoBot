import { Message } from 'discord.js';
import { Command } from '../../../../interfaces/Command';
import { clearApplication } from '../../../../modules/minecraft/whitelist/databaseTools';
import { WhitelistValidator } from '../../../../modules/minecraft/whitelist/validation';
import { WhitelistError } from '../constants/database';
import DENIED_MESSAGES from '../constants/deniedMessages';

class Remove implements Command {
    public name = 'remove';
    public aliases = ['r'];

    public async execute({ message }: { message: Message }) {
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
            DENIED_MESSAGES.SELF_NOT_FOUND(message);
            return;
        }

        message.channel.send(`Successfully removed your application, linked to Minecraft user '${removedUser?.minecraft}'`);
    }
}

export const remove = new Remove();
