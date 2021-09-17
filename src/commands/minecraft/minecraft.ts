import Command from '../../interfaces/Command';
import { Message } from 'discord.js';

const minecraft: Command = {
    name: 'ping',
    aliases: ['mc'],
    execute: ({ message }: { message: Message }) => {
        message.channel.send('hi there!');
    },
};

module.exports = minecraft;
