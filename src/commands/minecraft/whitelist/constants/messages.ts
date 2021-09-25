import { Message, User } from 'discord.js';
import { Statuses } from '../../../../models/user';
import { filterMentions } from '../../../../modules/mentionFilter';
import { SearchTypes } from '../helpers/username';

export const DENIED_MESSAGES = {
    NOT_IN_SERVER: (message: Message) => message.react('❌'),
    NO_PERMISSION: (message: Message) => message.react('❌'),
    NOT_SPECIFIED_USER: (message: Message) => message.channel.send(`Please specify a Minecraft username or Discord ID.`),
    NOT_SPECIFIED_COMMENT: (message: Message) => message.channel.send(`Please specify a comment.`),
    NOT_SPECIFIED_REASON: (message: Message) => message.channel.send(`Please specify a reason.`),
    INVALID_DISCORD_ID: (message: Message, thing: string) =>
        message.channel.send(`'${filterMentions(thing)}' is not a valid Discord ID.`),
    INVALID_MINECRAFT_USERNAME: (message: Message, username: string) =>
        message.channel.send(`'${filterMentions(username)}' is not a valid Minecraft username.`),
    INVALID_EITHER: (message: Message, thing: string) =>
        message.channel.send(`'${filterMentions(thing)}' is not a valid Discord ID or Minecraft username.`),
    ID_IS_YOURS: (message: Message) => message.channel.send(`You can not apply on behalf of yourself.`),
    TARGET_NOT_IN_SERVER: (message: Message, user: string) => message.channel.send(`<@${user}> is not in this server.`),
    IS_BOT: (message: Message, user: string) => message.channel.send(`<@${user}> is a bot.`),
    COMMENT_NOT_END_ARG: (message: Message) => message.channel.send(`Comments should be the last argument specified.`),
    COMMENT_BUT_NO_BEHALF: (message: Message) =>
        message.channel.send(`Comments can only be included if applying on behalf of someone else.`),
    MINECRAFT_TAKEN: (message: Message, minecraft: string) =>
        message.channel.send(`Minecraft user '${minecraft}' has already applied on another Discord account.`),
    DISCORD_TAKEN: (message: Message, discord: string, minecraft: string) =>
        message.channel.send(
            `${discord === message.author.id ? 'You have' : `<@${discord}> has`} already applied under user '${minecraft}'`
        ),
    NO_CONNECTION: (message: Message) =>
        message.channel.send(`Could not connect to the Minecraft server, please try again later.`),
    NOT_GUILD_CHANNEL: (message: Message) =>
        message.channel.send(`Whitelist-related commands only work in server test channels.`),
    SUBCOMMAND_NONEXISTANT: (message: Message, command: string) =>
        message.channel.send(`Subcommand '${filterMentions(command)}' does not exist.`),
    NO_HELP_FOUND: (message: Message, command: string) => message.channel.send(`No help found for '${command}' subcommand.`),
    UNRECOGNIZED_SUSPEND_ARG: (message: Message, arg: string) =>
        message.channel.send(`Unrecognized argument: '${filterMentions(arg)}', valid args are \`on\` and \`off\``),
};

export const OUTPUT_MESSAGES = {
    SELF_NOT_FOUND: (message: Message, status: Statuses | undefined) =>
        message.channel.send(`Couldn't find any${!!status ? ` ${status}` : ''} application linked your account.`),
    NOT_FOUND: (message: Message, searchType: SearchTypes, searchTerm: string, status: Statuses | undefined) =>
        message.channel.send(
            `Couldn't find any${!!status ? ` ${status}` : ''} applications linked to ${
                searchType === 'minecraft' ? `Minecraft user '${searchTerm}'` : `<@${searchTerm}>`
            }`
        ),
    NONE_FOUND: (message: Message, status: Statuses | undefined) =>
        message.channel.send(`Couldn't find any ${!!status ? ` ${status}` : ''} applications.`),
    MADE_NEW_REQUEST: (message: Message, minecraft: string, onBehalf: string) =>
        message.channel.send(
            `Successfully submitted a whitelist application linked to user '${minecraft}'${
                onBehalf !== message.author.id ? ` on behalf of <@${onBehalf}>` : ''
            }`
        ),
    REMOVED_YOUR_REQUEST: (message: Message, minecraft: string) =>
        message.channel.send(`Successfully removed your application, linked to Minecraft user '${minecraft}'`),
    CLEARED_REQUEST: (message: Message, discord: string, minecraft: string) =>
        message.channel.send(`Successfully cleared application by <@${discord}>, linked to Minecraft user '${minecraft}'`),
    FROZE_REQUEST: (message: Message, discord: string, minecraft: string) =>
        message.channel.send(`Successfully froze application by <@${discord}>, linked to Minecraft user '${minecraft}'`),
    BANNED_USER: (message: Message, discord: string, minecraft: string) =>
        message.channel.send(`Successfully banned <@${discord}>, linked to Minecraft user '${minecraft}'`),
    MINECRAFT_NOT_FOUND: (message: Message, minecraft: string) =>
        message.channel.send(`Couldn't find any applications linked to Minecraft user '${minecraft}'`),
    DISCORD_NOT_FOUND: (message: Message, discord: string) =>
        message.channel.send(`Couldn't find any applications linked to <@${discord}>`),
    WHITELIST_RCON_SUCCESS: (message: Message) => message.react('✅'),
    REJECTED_REQUEST: (message: Message) => message.react('✅'),
    ACCEPTED_ALREADY_WHITELISTED: (message: Message) => message.channel.send(`Player was already whitelisted.`),
    FROZEN_NOT_WHITELISTED: (message: Message) => message.channel.send(`Player was not whitelisted to begin with.`),
};
