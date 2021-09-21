import Command, * as Types from '../../../interfaces/Command';
import User from '../../../models/userOld';
import { devMode, modules } from '../../../config.json';
import Application from '../../../interfaces/Application';

import isAllowed from './isAllowed.module';
import isValidUsername from './isValidMinecraftUsername.module';

import makeMessage from './makeMessage.module';
import filterMessage from '../../../modules/mentionFilter.module';

const notifyRejected: boolean = modules.minecraft.whitelist.sendRejectedApplications;
const feedChannel: string = devMode
    ? modules.minecraft.whitelist.rejectedRequestFeedChannelDev
    : modules.minecraft.whitelist.rejectedRequestFeedChannel;

const reject: Command = {
    execute: async ({ message, args = [], client }: { message: Types.Message; args: string[]; client: Types.Client }) => {
        if (!isAllowed(message)) return;
        if (args[1] === undefined) {
            message.channel.send(`Please enter a username or tag a Discord user.`);
            return;
        }

        let searchTerm: string;

        if (args[1].includes('<@')) {
            searchTerm = args[1].replace(/[<@!>]/g, '');
        } else if (isValidUsername(args[1])) {
            searchTerm = args[1].toLowerCase();
        } else {
            message.channel.send(`'${filterMessage(args[1])}' is not a valid Minecraft username.`);
            return;
        }

        const updatedUser: Application | null = await User.findOneAndUpdate(
            {
                $and: [{ $or: [{ discord: searchTerm }, { minecraft: searchTerm }] }],
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
