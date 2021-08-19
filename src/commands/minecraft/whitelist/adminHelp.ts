import Command, * as Types from '../../../interfaces/Command';

const adminHelp: Command = {
    execute: async ({ message }: { message: Types.Message }) => {
        let output = `Admin Whitelist Commands:`;

        output += `\n\`neko w a <minecraft username>\` - Accept a whitelist application.`;
        output += `\n\`neko w r <minecraft username> <reason?>\` - Reject a whitelist application, reason optional.`;
        output += `\n\`neko w c <minecraft username or discord tag> <reason?>\` - Clears a whitelist application, allowing user to resubmit.`;
        output += `\n\`neko w l\` - List pending whitelist applications.`;

        message.channel.send(output);
    },
    help: async ({ message }: { message: Types.Message }) => {
        message.channel.send(`Basic rundown of whitelist module related commands.\nUsage: \`neko whitelist help\`\nAdmin only.`);
    },
};

export default adminHelp;
