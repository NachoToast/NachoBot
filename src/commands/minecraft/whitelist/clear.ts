import Command, * as Types from '../../../interfaces/Command';
import User from '../../../models/user';
import Application from '../../../interfaces/Application';

import { devMode, modules } from '../../../config.json';

import isAllowed from './isAllowed.module';
import isValidUsername from './isValidMinecraftUsername.module';

import makeMessage from './makeMessage.module';

const notifyRejected: boolean = modules.minecraft.whitelist.sendRejectedApplications;
const feedChannel: string = devMode
    ? modules.minecraft.whitelist.rejectedRequestFeedChannelDev
    : modules.minecraft.whitelist.rejectedRequestFeedChannel;

const clear: Command = {
    execute: async ({ message, args = [], client }: { message: Types.Message; args: string[]; client: Types.Client }) => {
        if (!isAllowed(message)) return;
        if (args[1] !== undefined && !isValidUsername(args[1]) && !args[1].includes('<@')) {
            message.channel.send(`'${args[1]}' is not a valid Minecraft username or Discord user.`);
            return;
        } else {
            args[1] = message.author.id;
        }

        const searchTerm = args[1].replace(/[<@!>]/g, '');

        const application: Application | null = await User.findOneAndDelete({
            $or: [{ discord: searchTerm }, { minecraft: searchTerm }],
        });

        if (application === null) {
            message.channel.send(`Couldn't find any application linked to '${args[1]}' to clear.`);
            return;
        }

        message.channel.send(
            `Cleared ${application.status} application for '${application.minecraft}' (<@${application.discord}>)${
                application.status === 'accepted'
                    ? `.\nNote that whitelist status isn't changed by the \`clear\` command, only the application.`
                    : '.'
            }`
        );

        if (notifyRejected) {
            const outputChannel: any | undefined = client.channels.cache.get(feedChannel);

            if (outputChannel !== undefined) {
                makeMessage('cleared', outputChannel, `<@${message.author.id}>`, application, args.slice(2).join(' '));
            }
        }
    },
    help: async ({ message }: { message: Types.Message }) => {
        message.channel.send(
            `Clears an application from the database, no matter the state. Whitelist remains unmodified.\nUsage: \`neko whitelist clear <username or discord tag> <reason?>\`\nAdmin use only.`
        );
    },
};

export default clear;
