// this example command uses 'export const'
import { Message } from 'discord.js';
import { Command } from '../../interfaces/Command';

export const exampleCommand: Command = {
    name: 'example_a',
    execute: async ({ message }: { message: Message }) => {
        message.channel.send('example command a!');
    },
};
