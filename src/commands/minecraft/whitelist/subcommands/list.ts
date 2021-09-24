import { Message } from 'discord.js';
import { Command } from '../../../../interfaces/Command';
import { Statuses } from '../../../../models/user';
import { searchApplications } from '../../../../modules/minecraft/whitelist/databaseTools';
import { massStatusEmbed } from '../../../../modules/minecraft/whitelist/embedConstructors';
import { maxApplicationsPerPage, WhitelistError } from '../constants/database';
import DENIED_MESSAGES from '../constants/deniedMessages';

class List implements Command {
    public name = 'list';
    public aliases = ['l'];

    public async execute({ args, isAdmin, message }: { args: string[]; isAdmin: boolean; message: Message }) {
        if (!isAdmin) {
            DENIED_MESSAGES.NO_PERMISSION(message);
            return;
        }
        args.splice(0, 1);

        const status = args[0] as Statuses | undefined;

        let page = undefined;
        if (!!args[1]) {
            if (!Number.isInteger(args[1])) {
                message.channel.send(`Please enter a valid page number.`);
                return;
            }
            page = parseInt(args[1]);
        }

        const applicationsFound = await searchApplications({ status, page });

        if (applicationsFound instanceof WhitelistError) {
            message.channel.send(applicationsFound.message);
            return;
        }

        if (!applicationsFound) {
            DENIED_MESSAGES.NONE_FOUND(message, status);
            return;
        }

        message.channel.send({
            embeds: [
                massStatusEmbed(applicationsFound.applications, applicationsFound.total, page, maxApplicationsPerPage, status),
            ],
        });
    }
}

export const list = new List();
