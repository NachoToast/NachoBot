// this example command uses 'export const', 'export default' and a class to export multiple commands in 1 file
import { Message } from 'discord.js';
import { Command } from '../../interfaces/Command';

export const exampleCommandA: Command = {
    name: 'example_e',
    execute: async ({ message }: { message: Message }) => {
        message.channel.send('example command e!');
    },
};

class ExampleCommandB implements Command {
    public name = 'example_f';
    public async execute({ message }: { message: Message }) {
        message.channel.send('example command f!');
    }
}

export const exampleCommand = new ExampleCommandB();

class ExampleCommandC implements Command {
    public name = 'example_g';
    public async execute({ message }: { message: Message }) {
        message.channel.send('example command g!');
    }
}

export default new ExampleCommandC();
