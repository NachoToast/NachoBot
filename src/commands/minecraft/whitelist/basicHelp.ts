import Command, * as Types from '../../../interfaces/Command';

const basicHelp: Command = {
    execute: async ({ message }: { message: Types.Message }) => {
        let output = `Whitelist Commands:`;

        output += `\n\`neko w <minecraft username>\` - Make a whitelist application, you can only have 1.`;
        output += `\n\`neko w q\` - See the status of your current whitelist application.`;
        output += `\n\`neko w r\` - Remove your current whitelist application (only works if it's pending).`;

        message.channel.send(output);
    },
    help: async ({ message }: { message: Types.Message }) => {
        message.channel.send(`Basic rundown of whitelist module related commands.\nUsage: \`neko whitelist help\``);
    },
};

export default basicHelp;
