import { Command } from '../../interfaces/Command';
import { prefixes } from '../../config.json';
import { Message } from 'discord.js';

export const help: Command = {
    name: 'help',
    aliases: ['h', '?'],
    execute: async ({ message }: { message: Message }) => {
        message.channel.send(
            `Use a command: \`<prefix> <command> <args?>\`\nGet Command Specific Help: \`<prefix> help <command> <args?>\`\nPrefixes: \`${prefixes
                .filter((e) => !e.includes('@'))
                .join('`, `')}\``
        );
    },
    help: async ({ message }: { message: Message }) => {
        help.execute({ message });
    },
};
