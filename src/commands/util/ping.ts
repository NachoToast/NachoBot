import Command from '../../interfaces/Command';
import { Message } from 'discord.js';

const ping: Command = {
    name: 'ping',
    aliases: ['p'],
    execute: ({ message }: { message: Message }) => {
        message.channel.send('hi there!');
    },
};

module.exports = ping;
