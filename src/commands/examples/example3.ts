// this example command uses 'export const' AND a class to export multiple commands in 1 file
import { Message } from 'discord.js';
import { Command } from '../../interfaces/Command';

export const exampleCommandA: Command = {
    name: 'example_c',
    execute: async ({ message }: { message: Message }) => {
        message.channel.send('example command c!');
    },
};

class ExampleCommandB implements Command {
    public name = 'example_d';
    public async execute({ message }: { message: Message }) {
        message.channel.send('example command d!');
    }
}

export const exampleCommand = new ExampleCommandB();
