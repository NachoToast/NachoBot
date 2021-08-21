import Command, * as Types from '../../../interfaces/Command';
import User from '../../../models/user';
import { devMode, modules } from '../../../config.json';
import Application from '../../../interfaces/Application';

import isAllowed from './isAllowed.module';
import isValidUsername from './isValidMinecraftUsername.module';

import makeMessage from './makeMessage.module';
import filterMessage from '../../../modules/mentionFilter.module';

const notifyAccepted: boolean = modules.minecraft.whitelist.sendAcceptedApplications;
const notifyRejected: boolean = modules.minecraft.whitelist.sendRejectedApplications;

const rejectedFeedChannel: string = devMode
    ? modules.minecraft.whitelist.rejectedRequestFeedChannelDev
    : modules.minecraft.whitelist.rejectedRequestFeedChannel;
const acceptedFeedChannel: string = devMode
    ? modules.minecraft.whitelist.acceptedRequestFeedChannelDev
    : modules.minecraft.whitelist.acceptedRequestFeedChannel;

const accept: Command = {
    execute: async ({
        message,
        args = [],
        rcon,
        client,
    }: {
        message: Types.Message;
        args: string[];
        rcon: Types.Rcon;
        client: Types.Client;
    }) => {
        if (!isAllowed(message)) return;
        if (!isValidUsername(args[1])) {
            message.channel.send(`'${filterMessage(args[1])}' is not a valid Minecraft username.`);
            return;
        }

        const updatedUser: Application | null = await User.findOneAndUpdate(
            {
                minecraft: args[1].toLowerCase(),
                status: 'pending',
            },
            { status: 'accepted' },
            { new: true }
        );

        if (updatedUser === null) {
            message.channel.send(`Couldn't find a pending whitelist application for '${args[1]}'.`);
            return;
        }

        const whitelistOutput: string = await rcon.send(`whitelist add ${args[1]}`);
        if (whitelistOutput === 'Player is already whitelisted') {
            message.channel.send(`Player '${args[1]}' is already whitelisted, marking as already whitelisted.`);
            if (notifyAccepted) {
                const outputChannel: any | undefined = client.channels.cache.get(acceptedFeedChannel);
                if (outputChannel !== undefined) {
                    makeMessage('accepted', outputChannel, `<@${client?.user?.id}>`, updatedUser);
                }
            }
            return;
        }
        if (whitelistOutput === 'That player does not exist') {
            message.channel.send(`Player '${args[1]}' does not exist, deleting application.`);

            const application: Application = await User.findOneAndDelete({
                minecraft: args[1],
                status: 'accepted',
            });

            if (application === null) {
                message.channel.send(`Error occured trying to delete application with user '${args[1]}'.`);
                return;
            }

            // try to send dm to person
            try {
                const user = await client.users.fetch(updatedUser.discord);
                await user.send(
                    `Hi ${user.username}, your whitelist application for '${updatedUser.minecraft}' was rejected because that Minecraft username doesn't appear to exist.`
                );
            } catch (error: any) {
                const outputChannel: any | undefined = client.channels.cache.get(acceptedFeedChannel);
                if (outputChannel !== undefined) {
                    makeMessage('rejected', outputChannel, `<@${client?.user?.id}>`, updatedUser, 'invalid username.');
                }
            }
            return;
        }

        if (notifyAccepted) {
            const outputChannel: any | undefined = client.channels.cache.get(acceptedFeedChannel);

            if (outputChannel !== undefined) {
                makeMessage('accepted', outputChannel, `<@${message.author.id}>`, updatedUser);
                // outputChannel.send(
                //     `${updatedUser.minecraft} (<@${updatedUser.discord}>) has been added to the whitelist by <@${
                //         message.author.id
                //     }> after ${moment(updatedUser.applied).fromNow(true)}.`
                // );
            }
        }
    },
    help: async ({ message }: { message: Types.Message }) => {
        message.channel.send(
            `Accepts a pending whitelist application request via Minecraft username.\nUsage: \`neko whitelist accept <username> \`\nAdmin use only.`
        );
    },
};

export default accept;
