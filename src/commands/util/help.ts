import Command from '../../interfaces/Command';
import { prefixes } from '../../config.json';

const help: Command = {
    name: 'help',
    aliases: ['h', '?'],
    execute: async () => {
        console.log('help command triggered!');
    },
};

module.exports = help;
