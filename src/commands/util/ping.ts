import Command from '../../interfaces/Command';
import { Message } from 'discord.js';
import { DiscordClient } from '../../interfaces/Client';

const ping: Command = {
    name: 'ping',
    aliases: ['p'],
    execute: async ({ client, message, args }: { client: DiscordClient; message: Message; args: string[] }) => {
        if (args.includes('mc')) {
            // mc related ping
        }

        let response = `Pongers! (${Math.abs(Date.now() - message.createdTimestamp)}ms)`;
        if (args.includes('v')) response += `\nAPI Latency: ${Math.round(client.ws.ping)}ms`;
        message.channel.send(response);
    },
    help: async ({ message }: { message: Message }) => {
        message.channel.send(
            `Pings the bot or related things.\nUsage: \`neko ping <flags>\`\n\nFlags: \`mc\` - Pings the Minecraft server.\n\`v\` - Gets Discord API latency.`
        );
    },
};

module.exports = ping;
