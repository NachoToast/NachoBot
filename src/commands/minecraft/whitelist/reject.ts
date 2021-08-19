import Command, * as Types from '../../../interfaces/Command';
import User from '../../../models/user';
import { devMode, modules } from '../../../config.json';
import Application from '../../../interfaces/Application';

import isAllowed from './isAllowed.module';
import isValidUsername from './isValidMinecraftUsername.module';

import makeMessage from './makeMessage.module';

const notifyRejected: boolean = modules.minecraft.whitelist.sendRejectedApplications;
const feedChannel: string = devMode
    ? modules.minecraft.whitelist.rejectedRequestFeedChannelDev
    : modules.minecraft.whitelist.rejectedRequestFeedChannel;

const reject: Command = {
    execute: async ({ message, args = [], client }: { message: Types.Message; args: string[]; client: Types.Client }) => {
        if (!isAllowed(message)) return;
        if (!isValidUsername(args[1])) {
            message.channel.send(`'${args[1]}' is not a valid Minecraft username.`);
            return;
        }

        const updatedUser: Application | null = await User.findOneAndUpdate(
            {
                minecraft: args[1],
                status: 'pending',
            },
            { status: 'rejected' },
            { new: true }
        );

        if (updatedUser === null) {
            message.channel.send(`Couldn't find a pending whitelist application for '${args[1]}'.`);
            return;
        }

        if (notifyRejected) {
            const outputChannel: any | undefined = client.channels.cache.get(feedChannel);

            if (outputChannel !== undefined) {
                makeMessage('rejected', outputChannel, `<@${message.author.id}>`, updatedUser, args.slice(2).join(' '));
            }
        }
    },
    help: async ({ message }: { message: Types.Message }) => {
        message.channel.send(
            `Rejects a pending whitelist application request via Minecraft username.\nUsage: \`neko whitelist reject <username> <reason?> \`\nAdmin use only.`
        );
    },
};

export default reject;
