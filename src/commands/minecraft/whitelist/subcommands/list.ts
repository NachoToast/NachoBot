import { Message, MessageEmbed } from 'discord.js';
import moment from 'moment';
import { Command } from '../../../../interfaces/Command';
import { Statuses } from '../../../../models/user';
import filterMessage, { removeUserTags, tagsUser } from '../../../../modules/mentionFilter.module';
import { getSingleDBUser, searchApplications } from '../../../../modules/minecraft/whitelist/databaseTools';
import { applicationInfoEmbed, massStatusEmbed } from '../../../../modules/minecraft/whitelist/embedConstructors';
import { isValidUsername } from '../../../../modules/minecraft/whitelist/username';

class List implements Command {
    public name = 'list';
    public aliases = ['l'];

    public async execute({ message, args, isAdmin }: { message: Message; args: string[]; isAdmin: boolean }) {
        args.splice(0, 1); // remove 's' from args

        if (!isAdmin) {
            message.react('❌');
            return;
        }

        let searchStatus: Statuses = 'pending';
        let searchPage = 1;
        if (!!args.length) {
            searchStatus = args[0] as Statuses;
            if (!!args[1]) {
                if (Number.isInteger(Number(args[1]))) searchPage = parseInt(args[1]);
                else {
                    message.channel.send(`${filterMessage(args[1])} is an invalid page number.`);
                    return;
                }
            }
        }

        const results = await searchApplications(searchStatus, searchPage);
        if (results === undefined) {
            message.channel.send(`Error occured querying database, please contact <@240312568273436674>`);
            return;
        } else if (results === null) {
            message.channel.send(`No ${filterMessage(searchStatus)} applications found.`);
            return;
        } else {
            if (results.applications.length <= 2) {
                const embeds: MessageEmbed[] = [];
                for (const result of results.applications) {
                    embeds.push(applicationInfoEmbed(message, result));
                }
                message.channel.send({ embeds });
            } else {
                const embed = massStatusEmbed(results.applications, results.total, searchStatus, searchPage, 20);
                message.channel.send({ embeds: [embed] });
            }
        }
    }

    public async help({ message }: { message: Message }) {
        message.channel.send(
            `List applications (optionally) by status (default pending) and page number(default 1).\nUsage: \`neko whitelist list <status?> <page?>\`\nAdmin only.`
        );
    }
}

export const list = new List();
