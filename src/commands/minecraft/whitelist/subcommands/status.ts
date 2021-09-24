import { Message } from 'discord.js';
import { Command } from '../../../../interfaces/Command';
import filterMessage, { removeUserTags, tagsUser } from '../../../../modules/mentionFilter.module';
import { getSingleDBUser } from '../../../../modules/minecraft/whitelist/databaseTools';
import { applicationStatusEmbed } from '../../../../modules/minecraft/whitelist/embedConstructors';
import { isValidUsername } from '../../../../modules/minecraft/whitelist/username';

class Status implements Command {
    public name = 'status';
    public aliases = ['s'];

    public async execute({ message, args }: { message: Message; args: string[] }) {
        args.splice(0, 1);

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
            message.channel.send(
                `Couldn't find any applications linked to ${
                    searchTerm === message.author.id ? 'you' : searchType === 'discord' ? `<@${searchTerm}>` : searchTerm
                }.`
            );
        } else {
            const embed = applicationStatusEmbed(message, existingDbUser);
            message.channel.send({ embeds: [embed] });
            return;
        }
    }

    public async help({ message }: { message: Message }) {
        message.channel.send(
            `See the status of your whitelist application, you can optionally include a Minecraft username or Discord mention/id.\nUsage: \`neko whitelist status <username|id?>\``
        );
    }
}

export const status = new Status();
