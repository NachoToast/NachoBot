import { Message, TextChannel } from 'discord.js';
import { Command, DiscordClient } from '../../../../interfaces/Command';
import filterMessage, { discordIdTest, removeUserTags, tagsUser } from '../../../../modules/mentionFilter.module';
import { isValidUsername, verifiedUsername } from '../../../../modules/minecraft/whitelist/username';
import { newApplicationEmbed } from '../../../../modules/minecraft/whitelist/embedConstructors';
import { devMode, modules } from '../../../../config.json';
import {
    makeNewApplication,
    getSingleDBUser,
    acceptApplication,
    rejectApplication,
} from '../../../../modules/minecraft/whitelist/databaseTools';
import { WhitelistValidator } from '../../../../modules/minecraft/whitelist/validation';
import moment from 'moment';
import minecraftServer from '../../../../modules/minecraft/rcon.module';

const notifyRejected = modules.minecraft.whitelist.sendRejectedApplications;
const feedChannel = devMode
    ? modules.minecraft.whitelist.rejectedRequestFeedChannelDev
    : modules.minecraft.whitelist.rejectedRequestFeedChannel;

export const reject: Command = {
    name: 'reject', // uppercase so its never actually called
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
        if (!isAdmin) {
            message.react('❌');
            return;
        }

        args.splice(0, 1);

        if (!args.length) {
            message.channel.send(`Please specify a Minecraft username or Discord user, and a reason for rejection.`);
            return;
        }

        let searchTerm = message.author.id;
        let searchType: 'discord' | 'minecraft' = 'discord';
        if (tagsUser.test(args[0])) {
            searchTerm = removeUserTags(args[0]);
        } else if (isValidUsername(args[0])) {
            searchTerm = args[0];
            searchType = 'minecraft';
        } else {
            message.channel.send(`${filterMessage(args[0])} is not a valid Minecraft username or Discord user.`);
            return;
        }
        args.splice(0, 1);

        // (if on behalf) check user specified is in valid Discord server & not a bot
        let comment = args.splice(0).join(' ');
        if (!comment.length) {
            message.channel.send('Please specify a reason');
            return;
        }

        const updatedUser = await rejectApplication(searchTerm, message.author.id, comment);
        if (updatedUser === undefined) {
            message.channel.send(`Error occured querying database, please contact <@240312568273436674>`);
            return;
        } else if (updatedUser === null) {
            message.channel.send(
                `Couldn't find a pending request linked ${searchType === 'discord' ? `<@${searchTerm}>` : searchTerm}`
            );
            return;
        }

        message.react('✅');

        if (notifyRejected) {
            const outputChannel = client.channels.cache.get(feedChannel) as TextChannel | undefined;

            if (!!outputChannel) {
                outputChannel.send(
                    `${updatedUser.minecraft} (<@${updatedUser.discord}>) has been rejected from the whitelist by <@${
                        message.author.id
                    }> after ${moment(updatedUser.applied).fromNow()}.`
                );
            }
        }
    },
    help: async ({ message }: { message: Message }) => {
        message.channel.send(
            `Rejects a whitelist application.\nUsage: \`neko whitelist reject <minecraft | discord> <...reason>\`\nAdmin only.`
        );
    },
};
// TODO: make this 1 big class definition instead
