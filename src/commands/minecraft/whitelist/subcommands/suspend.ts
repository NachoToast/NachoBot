import { Message, TextChannel } from 'discord.js';
import { Command, DiscordClient } from '../../../../interfaces/Command';
import { devMode, modules } from '../../../../config.json';
import { WhitelistValidator } from '../../../../modules/minecraft/whitelist/validation';

const notifyNew = modules.minecraft.whitelist.sendNewApplications;
const feedChannel = devMode
    ? modules.minecraft.whitelist.newRequestFeedChannelDev
    : modules.minecraft.whitelist.newRequestFeedChannel;

export const suspend: Command = {
    name: 'suspend', // uppercase so its never actually called
    execute: async ({
        message,
        args,
        client,
        isAdmin,
    }: {
        message: Message;
        args: string[];
        client: DiscordClient;
        isAdmin: boolean;
    }) => {
        args.splice(0, 1);

        if (!args.length) {
            message.channel.send(
                `Whitelist applications are ${WhitelistValidator.applicationsOpen ? '**not** ' : ''}currently suspended.`
            );
            return;
        }

        if (!isAdmin) {
            message.react('❌');
            return;
        }

        if (args.includes('on')) {
            if (!WhitelistValidator.applicationsOpen) {
                message.channel.send(`Whitelist applications are already suspended.`);
                return;
            }
            WhitelistValidator.applicationsOpen = false;
        } else if (args.includes('off')) {
            if (WhitelistValidator.applicationsOpen) {
                message.channel.send(`Whitelist applications aren't currently suspended.`);
                return;
            }
            WhitelistValidator.applicationsOpen = true;
        } else {
            message.channel.send('Invalid argument, should be either on or off.');
            return;
        }

        if (notifyNew) {
            const outputChannel = client.channels.cache.get(feedChannel) as TextChannel | undefined;
            if (!!outputChannel) {
                outputChannel.send(
                    `Whitelist applications have been turned **${WhitelistValidator.applicationsOpen ? 'off' : 'on'}** by <@${
                        message.author.id
                    }>`
                );
            }
        }
    },
    help: async ({ message }: { message: Message }) => {
        message.channel.send(
            `Suspends all whitelist applications and whitelist application-related actions. If you don't specify 'on' or 'off' will return current suspension status.\nUsage: \`neko whitelist suspend <on|off?>\`\nAdmin only.`
        );
    },
};
// TODO: make this 1 big class definition instead
