import { Message } from 'discord.js';
import { Command, DiscordClient } from '../../../../interfaces/Command';
import { makeLogItem, updateApplicationStatus } from '../helpers/databaseTools';
import { searchTypeAndTerm } from '../helpers/username';
import { WhitelistError } from '../constants/database';
import { DENIED_MESSAGES, OUTPUT_MESSAGES } from '../constants/messages';
import minecraftServer from '../../../../modules/minecraft/rcon';
import { WhitelistValidator } from '../helpers/validation';
import { getComment } from '../helpers/flags';
import { User } from '../../../../models/user';
import { createNotification } from '../helpers/notification';

class Accept implements Command {
    public name = 'accept';
    public aliases = ['a'];

    public adminOnly = true;
    public description = 'Accepts an application.';

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

        if (!WhitelistValidator.applicationsOpen) {
            message.channel.send(WhitelistValidator.message());
            return;
        }

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

        const newUserLog = makeLogItem(message.author.id, 'accepted', comment);

        const acceptedUser = await updateApplicationStatus(searchTerm, newUserLog, 'accepted', undefined);

        if (acceptedUser instanceof WhitelistError) {
            message.channel.send(acceptedUser.message);
            return;
        }

        if (!acceptedUser) {
            OUTPUT_MESSAGES.NOT_FOUND(message, searchType, searchTerm, undefined);
            return;
        }

        const doWhitelist = await minecraftServer.executeCommand(`whitelist add ${acceptedUser.minecraft}`);
        switch (doWhitelist) {
            case 'ERROR':
            case 'Not connected':
            case 'That player does not exist':
                message.channel.send(`${doWhitelist}, please contact <@240312568273436674>`);
                this.updateWithError(client, acceptedUser, doWhitelist);
                return;
            case 'Player is already whitelisted':
                OUTPUT_MESSAGES.ACCEPTED_ALREADY_WHITELISTED(message);
                break;
            default:
                OUTPUT_MESSAGES.WHITELIST_RCON_SUCCESS(message);
        }

        createNotification(client, 'accepted', acceptedUser, message.author.id, comment);
    }

    private async updateWithError(client: DiscordClient, user: User, errorMessage: string) {
        const errorLog = makeLogItem(
            client.user?.id as string,
            'pending',
            `Error occurred on whitelist attempt: ${errorMessage}`
        );
        updateApplicationStatus(user.discord, errorLog, 'pending');
    }
}

export const accept = new Accept();
