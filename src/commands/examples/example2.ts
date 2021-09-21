// this example command uses a class along with export const
// they are functionally the same, classes are just nicer :)
import { Message } from 'discord.js';
import { Command } from '../../interfaces/Command';

class ExampleCommand implements Command {
    public name = 'example_b';
    public async execute({ message }: { message: Message }) {
        message.channel.send('example command b!');
    }
}

export const exampleCommand = new ExampleCommand();
