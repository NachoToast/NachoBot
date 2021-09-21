import { Message, TextChannel } from 'discord.js';
import { Command, DiscordClient } from '../../../../interfaces/Command';
import filterMessage, { discordIdTest } from '../../../../modules/mentionFilter.module';
import { isValidUsername, verifiedUsername } from '../../../../modules/minecraft/whitelist/username';
import { newApplicationEmbed } from '../../../../modules/minecraft/whitelist/embedConstructors';
import { devMode, modules } from '../../../../config.json';
import { makeNewApplication, getSingleDBUser } from '../../../../modules/minecraft/whitelist/databaseTools';
import { WhitelistValidator } from '../../../../modules/minecraft/whitelist/validation';

const notifyNew = modules.minecraft.whitelist.sendNewApplications;
const feedChannel = devMode
    ? modules.minecraft.whitelist.newRequestFeedChannelDev
    : modules.minecraft.whitelist.newRequestFeedChannel;

export const apply: Command = {
    name: 'APPLY', // uppercase so its never actually called
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
        if (!WhitelistValidator.applicationsOpen) {
            message.channel.send(`Whitelist applications are currently suspended.`);
            return;
        }

        if (!args.length) {
            message.channel.send(`Please specify your Minecraft username.`);
            return;
        }

        // message.member is null if done in DMs instead of server channel
        if (message.member === null) {
            message.channel.send(`Please do this in the correct server.`);
            return;
        }

        const rawMinecraftUsername = args[0];
        let discordID = message.author.id;

        let onBehalf = false;
        const fromIndex = args.indexOf('f') + 1;
        if (!!fromIndex) {
            if (isAdmin) {
                if (!!args[fromIndex]) {
                    discordID = args[fromIndex].replace(/[<>!@]/g, '');
                    if (discordIdTest.test(discordID)) {
                        message.channel.send(`${discordID} is not a valid Discord ID.`);
                        return;
                    } else if (discordID === message.author.id) {
                        message.channel.send(`You can't apply on behalf of yourself.`);
                        return;
                    }
                    onBehalf = true;
                    args.splice(fromIndex - 1, 2);
                } else {
                    message.channel.send(`Please specify a Discord ID or mention to whitelist as someone else.`);
                    return;
                }
            } else {
                message.react('❌');
                return;
            }
        }

        if (!isValidUsername(rawMinecraftUsername)) {
            message.channel.send(`'${filterMessage(rawMinecraftUsername)}' is not a valid Minecraft username.`);
            return;
        }

        const [isVerified, minecraftUsername] = await verifiedUsername(rawMinecraftUsername);

        // check whitelist
        if (!isVerified) {
            // TODO: give info about player ticket?
            if (minecraftUsername === 'Player is already whitelisted') {
                message.channel.send(`Player '${rawMinecraftUsername}' is already whitelisted`);
            } else if (minecraftUsername === 'That player does not exist') {
                message.channel.send(`User '${rawMinecraftUsername}' does not exist.`);
            } else if (minecraftUsername === 'Not connected') {
                message.channel.send(`Server is currently down, please try again later.`);
            } else {
                // only other case is beginning with 'FATAL: '
                console.log(minecraftUsername.slice(7));
                message.channel.send(`An error occured, this should never happen. Please contact <@240312568273436674>`);
            }
            return;
        }

        // check db (since discordID could also be already used)
        const existingDbUser = await getSingleDBUser(discordID, rawMinecraftUsername);
        if (existingDbUser === undefined) {
            message.channel.send(`Error occured querying database, please contact <@240312568273436674>`);
            return;
        }

        if (existingDbUser !== null) {
            if (existingDbUser.discord === discordID) {
                message.channel.send(
                    `You already have an application linked to Minecraft user '${existingDbUser.minecraft}', you can view its status with \`neko whitelist status\``
                );
            } else {
                message.channel.send(`Minecraft user '${minecraftUsername}' has already applied via another Discord account.`);
            }
            return;
        }

        // (if on behalf) check user specified is in valid Discord server & not a bot
        let userDiscord = message.member;
        if (onBehalf) {
            const possibleUser = (message.channel as TextChannel).guild.members.cache.get(discordID);
            if (!possibleUser) {
                message.channel.send(`That user is not in this server.`);
                return;
            }
            if (possibleUser.user.bot) {
                message.channel.send(`That user is a bot.`);
                return;
            }
            userDiscord = possibleUser;
        }

        let comment = onBehalf ? 'Applied on their behalf' : 'Initial application';
        // if comment parameter specified, use it instead of default comment
        const commentIndex = args.indexOf('c') + 1;
        if (!!commentIndex) {
            if (isAdmin) {
                if (!!args[commentIndex]) {
                    comment = args.slice(commentIndex).join(' ');
                } else {
                    message.channel.send(`Please specify a comment.`);
                    return;
                }
            } else {
                message.react('❌');
                return;
            }
        }

        const newUser = await makeNewApplication(minecraftUsername, discordID, comment);
        if (!newUser) {
            message.channel.send(`Error occured making database entry, please contact <@240312568273436674>`);
            return;
        }

        message.channel.send(
            `Successfully submitted a whitelist application for '${minecraftUsername}'${
                onBehalf ? ` on behalf of <@${discordID}>` : ''
            }.`
        );

        if (notifyNew) {
            const outputChannel = client.channels.cache.get(feedChannel) as TextChannel | undefined;

            if (!!outputChannel) {
                const embed = newApplicationEmbed(outputChannel, newUser, userDiscord);
                outputChannel.send({ embeds: [embed] });
            }
        }
    },
};
// TODO: make this 1 big class definition instead
