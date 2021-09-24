import { Message } from 'discord.js';
import { Command } from '../../../../interfaces/Command';
import { getSingleDBUser } from '../../../../modules/minecraft/whitelist/databaseTools';
import { applicationStatusEmbed } from '../../../../modules/minecraft/whitelist/embedConstructors';
import { WhitelistError } from '../constants/database';
import DENIED_MESSAGES from '../constants/deniedMessages';

class Status implements Command {
    public name = 'status';
    public aliases = ['s'];

    public async execute({ message }: { message: Message }) {
        const existingUser = await getSingleDBUser(message.author.id);

        if (existingUser instanceof WhitelistError) {
            message.channel.send(existingUser.message);
            return;
        }

        if (!existingUser) {
            DENIED_MESSAGES.SELF_NOT_FOUND(message);
            return;
        }

        message.channel.send({ embeds: [applicationStatusEmbed(message, existingUser)] });
    }
}

export const status = new Status();
