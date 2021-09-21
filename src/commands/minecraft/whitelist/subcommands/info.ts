import { Message } from 'discord.js';
import { Command } from '../../../../interfaces/Command';
import filterMessage, { removeUserTags, tagsUser } from '../../../../modules/mentionFilter.module';
import { getSingleDBUser } from '../../../../modules/minecraft/whitelist/databaseTools';
import { applicationInfoEmbed } from '../../../../modules/minecraft/whitelist/embedConstructors';
import { isValidUsername } from '../../../../modules/minecraft/whitelist/username';

class Info implements Command {
    public name = 'info';
    public aliases = ['i'];

    public async execute({ message, args, isAdmin }: { message: Message; args: string[]; isAdmin: boolean }) {
        args.splice(0, 1); // remove 's' from args

        if (!isAdmin) {
            message.react('❌');
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
            message.channel.send(
                `Couldn't find any applications linked to ${
                    searchTerm === message.author.id ? 'you' : searchType === 'discord' ? `<@${searchTerm}>` : searchTerm
                }.`
            );
            return;
        } else {
            const embed = applicationInfoEmbed(message, existingDbUser);
            message.channel.send({ embeds: [embed] });
            return;
        }
    }

    public async help({ message, isAdmin }: { message: Message; isAdmin: boolean }) {
        if (!isAdmin) {
            message.react('❌');
            return;
        }
        message.channel.send(
            `Get information about a whitelist application, includes vetting info.\nUsage: \`neko whitelist info <username|id?>\`\nAdmin only.`
        );
    }
}

export const info = new Info();
