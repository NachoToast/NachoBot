import { Message } from 'discord.js';
import { Command, DiscordClient } from '../../../../interfaces/Command';
import filterMessage, { removeUserTags, tagsUser } from '../../../../modules/mentionFilter.module';
import { isValidUsername } from '../../../../modules/minecraft/whitelist/username';
import { getSingleDBUser, removeEntry } from '../../../../modules/minecraft/whitelist/databaseTools';

export const clear: Command = {
    name: 'clear',
    aliases: ['c'],
    execute: async ({ message, args, isAdmin }: { message: Message; args: string[]; isAdmin: boolean }) => {
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

        const existingDbUser = await getSingleDBUser(searchTerm, searchTerm);
        if (existingDbUser === undefined) {
            message.channel.send(`Error occured querying database, please contact <@240312568273436674>`);
            return;
        } else if (existingDbUser === null) {
            message.channel.send(`Couldn't find an application to remove.`);
            return;
        }

        const deletedUser = await removeEntry(existingDbUser.discord, existingDbUser.status);
        if (deletedUser === undefined) {
            message.channel.send(`Error occured removing from database, please contact <@240312568273436674>`);
        } else if (!deletedUser) {
            message.channel.send(
                `Unable to find user to remove from database, this is an error, please contact <@240312568273436674>`
            );
        } else {
            message.channel.send(
                `Successfully cleared <@${existingDbUser.discord}>\'s application (Minecraft '${existingDbUser.minecraft}')`
            );
        }
    },
    help: async ({ message }: { message: Message }) => {
        message.channel.send(
            `Clears a whitelist application, no matter what status. Note this won't accordingly update whitelist status, only the online database entry.\nUsage: \`neko whitelist clear <minecraft | discord>\`\nAdmin only.`
        );
    },
};
// TODO: make this 1 big class definition instead
