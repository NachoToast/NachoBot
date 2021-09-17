import Command from '../../../interfaces/Command';
import { Message } from 'discord.js';

const index: Command = {
    name: 'whitelist',
    aliases: ['w'],
    execute: ({ message }: { message: Message }) => {
        message.channel.send('hi there!');
    },
    numSubCommands: 686969,
};

module.exports = index;
