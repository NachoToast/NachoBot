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

class Freeze implements Command {
    public name = 'freeze';
    public aliases = ['f'];

    public adminOnly = true;
    public description = 'Freezes an application.';
    public extendedDescription = `Removes the user from the whitelist and puts their application in a frozen state.`;

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

        const frozenUserLog = makeLogItem(message.author.id, 'frozen', comment);

        const frozenUser = await updateApplicationStatus(searchTerm, frozenUserLog, 'frozen', undefined);

        if (frozenUser instanceof WhitelistError) {
            message.channel.send(frozenUser.message);
            return;
        }

        if (!frozenUser) {
            OUTPUT_MESSAGES.NOT_FOUND(message, searchType, searchTerm, undefined);
            return;
        }

        const unWhitelist = await minecraftServer.executeCommand(`whitelist remove ${frozenUser.minecraft}`);

        switch (unWhitelist) {
            case 'ERROR':
            case 'Not connected':
            case 'That player does not exist':
                message.channel.send(`${unWhitelist}, please contact <@240312568273436674>`);
                this.updateWithError(client, frozenUser, unWhitelist);
                return;
            case 'Player is not whitelisted':
                OUTPUT_MESSAGES.FROZEN_NOT_WHITELISTED(message);
                break;
            default:
                const doKick = await minecraftServer.executeCommand(
                    `kick ${frozenUser.minecraft} Your application has been frozen temporarily.`
                );
                switch (doKick) {
                    case 'ERROR':
                    case 'Not connected':
                        message.channel.send(`${doKick}, please contact <@240312568273436674>`);
                        this.updateWithError(client, frozenUser, doKick);
                        return;
                    default:
                        break;
                }
        }

        OUTPUT_MESSAGES.FROZE_REQUEST(message, frozenUser.discord, frozenUser.minecraft);

        createNotification(client, 'frozen', frozenUser, message.author.id, comment);
    }

    private async updateWithError(client: DiscordClient, user: User, errorMessage: string) {
        const errorLog = makeLogItem(client.user?.id as string, 'pending', `Error occurred on freeze attempt: ${errorMessage}`);
        updateApplicationStatus(user.discord, errorLog, 'pending');
    }
}

export const freeze = new Freeze();
