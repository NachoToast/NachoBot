import { Message } from 'discord.js';
import { Statuses } from '../../../../models/user';
import { filterMentions } from '../../../../modules/mentionFilter';
import { SearchTypes } from '../../../../modules/minecraft/whitelist/username';

const DENIED_MESSAGES = {
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
    NOT_IN_SERVER: (message: Message, user: string) => message.channel.send(`<@${user}> is not in this server.`),
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
    SELF_NOT_FOUND: (message: Message) => message.channel.send(`Couldn't find any requests linked your account.`),
    NOT_FOUND: (message: Message, searchType: SearchTypes, searchTerm: string, status: Statuses | undefined) =>
        message.channel.send(
            `Couldn't find any${` ${status}` || ''} requests linked to ${
                searchType === 'minecraft' ? `user '${searchTerm}'` : `<@${searchTerm}>`
            }`
        ),
    NONE_FOUND: (message: Message, status: Statuses | undefined) => {
        message.channel.send(`Couldn't find any ${` ${status}` || ''} requests.`);
    },
};

export default DENIED_MESSAGES;
