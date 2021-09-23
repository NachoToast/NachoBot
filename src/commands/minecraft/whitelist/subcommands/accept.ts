import { Message, TextChannel } from 'discord.js';
import { Command, DiscordClient } from '../../../../interfaces/Command';
import filterMessage, { discordIdTest, removeUserTags, tagsUser } from '../../../../modules/mentionFilter.module';
import { isValidUsername, verifiedUsername } from '../../../../modules/minecraft/whitelist/username';
import { newApplicationEmbed } from '../../../../modules/minecraft/whitelist/embedConstructors';
import { devMode, modules } from '../../../../config.json';
import { makeNewApplication, getSingleDBUser, acceptApplication } from '../../../../modules/minecraft/whitelist/databaseTools';
import { WhitelistValidator } from '../../../../modules/minecraft/whitelist/validation';
import moment from 'moment';
import minecraftServer from '../../../../modules/minecraft/rcon.module';

const notifyAccepted = modules.minecraft.whitelist.sendAcceptedApplications;
const feedChannel = devMode
    ? modules.minecraft.whitelist.acceptedRequestFeedChannelDev
    : modules.minecraft.whitelist.acceptedRequestFeedChannel;

export const accept: Command = {
    name: 'accept', // uppercase so its never actually called
    aliases: ['a'],
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
            message.channel.send(`Please specify a Minecraft username or Discord user.`);
            return;
        }

        let searchTerm = message.author.id;
        let searchType: 'discord' | 'minecraft' = 'discord';
        if (!!args.length) {
            if (tagsUser.test(args[0])) {
                searchTerm = removeUserTags(args[0]);
            } else if (isValidUsername(args[0])) {
                searchTerm = args[0];
                searchType = 'minecraft';
            } else {
                message.channel.send(`${filterMessage(args[0])} is not a valid Minecraft username or Discord user.`);
                return;
            }
        }

        // (if on behalf) check user specified is in valid Discord server & not a bot
        let comment: string | undefined;
        // if comment parameter specified, use it instead of default comment
        const commentIndex = args.indexOf('c') + 1;
        if (!!commentIndex) {
            if (!!args[commentIndex]) {
                comment = args.slice(commentIndex).join(' ');
            } else {
                message.channel.send(`Please specify a comment.`);
                return;
            }
        }

        const updatedUser = await acceptApplication(searchTerm, message.author.id, comment);
        if (updatedUser === undefined) {
            message.channel.send(`Error occured querying database, please contact <@240312568273436674>`);
            return;
        } else if (updatedUser === null) {
            message.channel.send(
                `Couldn't find a pending request linked ${searchType === 'discord' ? `<@${searchTerm}>` : searchTerm}`
            );
            return;
        }

        const didActuallyUpdate = await minecraftServer.executeCommand(`whitelist add ${updatedUser.minecraft}`);
        if (didActuallyUpdate !== `Added ${updatedUser.minecraft} to the whitelist`) {
            message.channel.send(`Encountered error executing whitelist command:\n\`\`\`${didActuallyUpdate}\`\`\``);
            // todo: update db user when this occurs
            return;
        }

        message.react('✅');

        if (notifyAccepted) {
            const outputChannel = client.channels.cache.get(feedChannel) as TextChannel | undefined;

            if (!!outputChannel) {
                // TODO: maybe make this a nicely formatted embed?
                outputChannel.send(
                    `${updatedUser.minecraft} (<@${updatedUser.discord}>) has been added to the whitelist by <@${
                        message.author.id
                    }> after ${moment(updatedUser.applied).fromNow()}.`
                );
            }
        }
    },
    help: async ({ message }: { message: Message }) => {
        message.channel.send(
            `Accepts a whitelist application, adding the user to the server.\nUsage: \`neko whitelist accept <minecraft | discord>\`\nAdmin only.`
        );
    },
};
// TODO: make this 1 big class definition instead
