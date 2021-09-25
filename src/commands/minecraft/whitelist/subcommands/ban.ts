import { Message } from 'discord.js';
import { Command, DiscordClient } from '../../../../interfaces/Command';
import { User } from '../../../../models/user';
import minecraftServer from '../../../../modules/minecraft/rcon';
import { WhitelistError } from '../constants/database';
import { DENIED_MESSAGES, OUTPUT_MESSAGES } from '../constants/messages';
import { makeLogItem, updateApplicationStatus } from '../helpers/databaseTools';
import { getComment } from '../helpers/flags';
import { createNotification } from '../helpers/notification';
import { searchTypeAndTerm } from '../helpers/username';

class Ban implements Command {
    public name = 'ban';
    public aliases = ['b'];

    public adminOnly = true;
    public description = 'Bans a user from the Minecraft server.';

    public async execute({
        args,
        client,
        isAdmin,
        message,
    }: {
        args: string[];
        client: DiscordClient;
        isAdmin: boolean;
        message: Message;
    }) {
        if (!isAdmin) {
            DENIED_MESSAGES.NO_PERMISSION(message);
            return;
        }

        // freeze can be used when applications are suspended

        if (!args.length) {
            DENIED_MESSAGES.NOT_SPECIFIED_USER(message);
            return;
        }

        const [searchType, searchTerm] = searchTypeAndTerm(args[0]);

        if (searchType === 'invalid') {
            DENIED_MESSAGES.INVALID_EITHER(message, args[0]);
            return;
        }

        const comment = getComment(message, args, isAdmin, undefined);
        if (comment === false) return;

        const bannedUserLog = makeLogItem(message.author.id, 'banned', comment);

        const bannedUser = await updateApplicationStatus(searchTerm, bannedUserLog, 'banned', 'accepted');

        if (bannedUser instanceof WhitelistError) {
            message.channel.send(bannedUser.message);
            return;
        }

        if (!bannedUser) {
            OUTPUT_MESSAGES.NOT_FOUND(message, searchType, searchTerm, 'accepted');
            return;
        }

        const unWhitelist = await minecraftServer.executeCommand(`whitelist remove ${bannedUser.minecraft}`);

        switch (unWhitelist) {
            case 'ERROR':
            case 'Not connected':
            case 'That player does not exist':
                message.channel.send(`${unWhitelist}, please contact <@240312568273436674>`);
                this.updateWithError(client, bannedUser, unWhitelist);
                return;
            case 'Player is not whitelisted':
                OUTPUT_MESSAGES.FROZEN_NOT_WHITELISTED(message);
                break;
            default:
                await minecraftServer.executeCommand(
                    `kick ${bannedUser.minecraft} You have been banned by ${message.author.username}: ${bannedUserLog.comment}.`
                );
                const doBan = await minecraftServer.executeCommand(`ban ${bannedUser.minecraft}`);
                switch (doBan) {
                    case 'ERROR':
                    case 'Not connected':
                        message.channel.send(`${doBan}, please contact <@240312568273436674>`);
                        this.updateWithError(client, bannedUser, doBan);
                        return;
                    default:
                        break;
                }
        }

        OUTPUT_MESSAGES.BANNED_USER(message, bannedUser.discord, bannedUser.minecraft);

        createNotification(client, 'banned', bannedUser, message.author.id, comment);
    }

    private async updateWithError(client: DiscordClient, user: User, errorMessage: string) {
        const errorLog = makeLogItem(client.user?.id as string, 'pending', `Error occurred on ban attempt: ${errorMessage}`);
        updateApplicationStatus(user.discord, errorLog, 'pending');
    }
}

export const ban = new Ban();
