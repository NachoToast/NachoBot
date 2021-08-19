import Command, * as Types from '../../interfaces/Command';
import { prefixes } from '../../config.json';

const help: Command = {
    name: 'help',
    aliases: ['h', '?'],
    execute: async ({ message }: { message: Types.Message }) => {
        message.channel.send(
            `Use a Command: \`<prefix> <command> <args?>\`\nGet Command Specific Help: \`<prefix> <help> <command> <args?>\`\nPrefixes: \`${prefixes.join(
                '`, `'
            )}\``
        );
    },
    help: async () => {
        console.log(`Help command induced for the help command, this should never happen.`);
    },
};

module.exports = help;
