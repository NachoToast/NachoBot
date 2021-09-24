import { Message, TextChannel } from 'discord.js';
import { Command, DiscordClient } from '../../../../interfaces/Command';
import { filterMentions } from '../../../../modules/mentionFilter';
import { WhitelistValidator } from '../../../../modules/minecraft/whitelist/validation';
import DENIED_MESSAGES from '../constants/deniedMessages';
import { devMode, modules } from '../../../../config.json';

const notifyAccepted = modules.minecraft.whitelist.sendAcceptedApplications;
const feedChannel = devMode
    ? modules.minecraft.whitelist.acceptedRequestFeedChannelDev
    : modules.minecraft.whitelist.acceptedRequestFeedChannel;

class Suspend implements Command {
    public name = 'suspend';

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
        args.splice(0, 1);
        if (!args.length) {
            message.channel.send(WhitelistValidator.message());
            return;
        }

        if (!isAdmin) {
            DENIED_MESSAGES.NO_PERMISSION(message);
            return;
        }

        if (args[0].toLowerCase() === 'on') {
            if (!WhitelistValidator.applicationsOpen) {
                message.channel.send(`Applications are already suspended.`);
                return;
            }
            WhitelistValidator.applicationsOpen = false;
        } else if (args[0].toLowerCase() === 'off') {
            if (WhitelistValidator.applicationsOpen) {
                message.channel.send(`Applications are already open.`);
                return;
            }
            WhitelistValidator.applicationsOpen = true;
        } else {
            message.channel.send(`Unrecognized argument, '${filterMentions(args[0])}'`);
            return;
        }

        if (notifyAccepted) {
            const outputChannel = client.channels.cache.get(feedChannel) as TextChannel | undefined;

            if (!!outputChannel) {
                message.channel.send(WhitelistValidator.message());
            }
        }
    }
}

export const suspend = new Suspend();
