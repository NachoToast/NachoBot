import { Message } from 'discord.js';
import { Command } from '../../../../interfaces/Command';
import { Statuses } from '../../../../models/user';
import { searchApplications } from '../helpers/databaseTools';
import { massStatusEmbed } from '../helpers/embedConstructors';
import { maxApplicationsPerPage, WhitelistError } from '../constants/database';
import { DENIED_MESSAGES, OUTPUT_MESSAGES } from '../constants/messages';

class List implements Command {
    public name = 'list';
    public aliases = ['l'];

    public adminOnly = true;
    public description = 'Lists whitelist applications.';
    public extendedDescription =
        'Shows list of applicants and time applied. Can be filtered by specifying a status. Default page number is 1. Will show the status if not filtering.';

    public async execute({ args, isAdmin, message }: { args: string[]; isAdmin: boolean; message: Message }) {
        if (!isAdmin) {
            DENIED_MESSAGES.NO_PERMISSION(message);
            return;
        }

        let status: Statuses | undefined;
        let page: number | undefined;

        if (!!args.length) {
            if (Number.isInteger(parseInt(args[0]))) page = parseInt(args[0]);
            else status = args[0] as Statuses;

            if (!!args[1]) {
                if (Number.isInteger(parseInt(args[1]))) page = parseInt(args[1]);
                else status = args[1] as Statuses;
            }
        }

        const applicationsFound = await searchApplications({ status, page });

        if (applicationsFound instanceof WhitelistError) {
            message.channel.send(applicationsFound.message);
            return;
        }

        if (!applicationsFound) {
            OUTPUT_MESSAGES.NONE_FOUND(message, status);
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
