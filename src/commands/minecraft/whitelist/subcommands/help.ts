import { Message } from 'discord.js';
import { CommandClass } from '../../../../interfaces/Command';

export const basicHelp: CommandClass = {
    execute: async ({ message }: { message: Message }) => {
        let output = `Whitelist Commands:`;

        output += `\n\`neko w <minecraft username>\` - Make a whitelist application, you can only have 1.`;
        output += `\n\`neko w q\` - See the status of your current whitelist application.`;
        output += `\n\`neko w r\` - Remove your current whitelist application (only works if it's pending).`;

        message.channel.send(output);
    },
    help: async ({ message }: { message: Message }) => {
        message.channel.send(`Basic rundown of whitelist module related commands.\nUsage: \`neko whitelist help\``);
    },
};

export const adminHelp: CommandClass = {
    execute: async ({ message }: { message: Message }) => {
        let output = `Admin Whitelist Commands:`;

        output += `\n\`neko w a <minecraft username>\` - Accept a whitelist application.`;
        output += `\n\`neko w r <minecraft username> <reason?>\` - Reject a whitelist application, reason optional.`;
        output += `\n\`neko w c <minecraft username or discord tag> <reason?>\` - Clears a whitelist application, allowing user to resubmit.`;
        output += `\n\`neko w l\` - List pending whitelist applications.`;

        message.channel.send(output);
    },
    help: async ({ message }: { message: Message }) => {
        message.channel.send(`Basic rundown of whitelist module related commands.\nUsage: \`neko whitelist help\`\nAdmin only.`);
    },
};
