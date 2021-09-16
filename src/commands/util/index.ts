import Command from '../../interfaces/Command';
import { Message } from 'discord.js';

const util: Command = {
    name: 'hello',
    aliases: ['?'],
    execute: ({ message }: { message: Message }) => {
        message.channel.send('hi there!');
    },
};

module.exports = util;
