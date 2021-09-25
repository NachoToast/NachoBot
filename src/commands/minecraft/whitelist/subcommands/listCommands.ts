import { Message } from 'discord.js';
import { Command } from '../../../../interfaces/Command';
import { commandListEmbed } from '../helpers/embedConstructors';

class ListCommands implements Command {
    public name = 'listcommands';
    public aliases = ['lc', 'cl', 'commandlist', 'commands'];

    public adminOnly = false;
    public description = 'Lists commands.';
    public extendedDescription = 'Lists all whitelist-related commands and their summaries. Grouped by permission level.';

    public async execute({ message }: { message: Message }) {
        message.channel.send({ embeds: [commandListEmbed()] });
    }
}

export const listCommands = new ListCommands();
