import { Message } from 'discord.js';
import { Command } from '../../../../interfaces/Command';

class Help implements Command {
    public name = 'help';
    public aliases = ['h'];
    public async execute({ message, args, isAdmin }: { message: Message; args: string[]; isAdmin: boolean }) {
        const forceAdmin = args.includes('admin');
        const forceBasic = args.includes('basic');
        if ((isAdmin && !forceBasic) || forceAdmin) this.adminHelp(message);
        else this.basicHelp(message);
    }

    private async basicHelp(message: Message) {
        let output = `Whitelist Commands:`;

        output += `\n\`neko w <minecraft username>\` - Make a whitelist application, you can only have 1.`;
        output += `\n\`neko w q\` - See the status of your current whitelist application.`;
        output += `\n\`neko w r\` - Remove your current whitelist application (only works if it's pending).`;

        message.channel.send(output);
    }
    private async adminHelp(message: Message) {
        let output = `Admin Whitelist Commands:`;

        output += `\n\`neko w a <minecraft username>\` - Accept a whitelist application.`;
        output += `\n\`neko w r <minecraft username> <reason?>\` - Reject a whitelist application, reason optional.`;
        output += `\n\`neko w c <minecraft username or discord tag> <reason?>\` - Clears a whitelist application, allowing user to resubmit.`;
        output += `\n\`neko w l\` - List pending whitelist applications.`;

        message.channel.send(output);
    }

    public async help({ message }: { message: Message }) {
        message.channel.send(
            `Rundown of whitelist-related commands.\nUsage: \`neko whitelist help\`\nYou can also get admin or non-admin specific help by doing \`neko whitelist help admin\` or \`neko whitelist help basic\` respectively.`
        );
    }
}

export const help = new Help();
