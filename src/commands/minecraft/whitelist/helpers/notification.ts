import { MessageEmbed, TextChannel } from 'discord.js';
import moment from 'moment';
import { devMode, modules } from '../../../../config.json';
import { DiscordClient } from '../../../../interfaces/Command';
import { Statuses, User } from '../../../../models/user';
import { applicationInfoEmbed } from './embedConstructors';
import { WhitelistValidator } from './validation';

type ExtendedStatuses = Statuses | 'removed' | 'cleared' | 'suspend';

const WHITELIST_SETTINGS = modules.minecraft.whitelist;

export const publicChannel = devMode ? WHITELIST_SETTINGS.publicChannelDev : WHITELIST_SETTINGS.publicChannel;
const privateChannel = devMode ? WHITELIST_SETTINGS.privateChannelDev : WHITELIST_SETTINGS.privateChannel;

/** Creates a relevant notification in its channel (specified in `config.json`) if enabled. */
export function createNotification(
    client: DiscordClient,
    type: ExtendedStatuses,
    user: User | null,
    doneBy: string,
    comment: string | undefined
) {
    let attemptedOutputChannel;

    if (WHITELIST_SETTINGS.broadcastPrivate.includes(type)) {
        attemptedOutputChannel = privateChannel;
    } else if (WHITELIST_SETTINGS.broadcastPublic.includes(type)) {
        attemptedOutputChannel = publicChannel;
    } else return;

    const outputChannel = client.channels.cache.get(attemptedOutputChannel);

    if (!outputChannel) return;
    if (outputChannel.type !== 'GUILD_TEXT') return;

    const outputMessage = notificationActionMap[type](user as User, doneBy, comment, outputChannel as TextChannel);

    if (outputMessage instanceof MessageEmbed) {
        (outputChannel as TextChannel).send({ embeds: [outputMessage] });
    } else {
        (outputChannel as TextChannel).send(outputMessage);
    }
}

type NotificationActionFunction = (
    user: User,
    doneBy: string,
    comment: string | undefined,
    channel: TextChannel
) => string | MessageEmbed;
const notificationActionMap: { [key in ExtendedStatuses]: NotificationActionFunction } = {
    accepted: (user, doneBy, comment) =>
        `${user.minecraft} (<@${user.discord}>) has been added to the whitelist by <@${doneBy}> after ${moment(
            user.applied
        ).fromNow(true)}${!!comment ? ` with comment: *${comment}*` : ''}.`,
    rejected: (user, doneBy, comment) =>
        `Request by ${user.minecraft} (<@${user.discord}>) has been rejected by <@${doneBy}> after ${moment(user.applied).fromNow(
            true
        )}${!!comment ? `with comment: *${comment}*` : ''}.`,
    removed: (user) => `<@${user.discord}> removed their application, linked to Minecraft user '${user.minecraft}'`,
    cleared: (user, doneBy, comment) =>
        `Request by ${user.minecraft} (<@${user.discord}>) has been cleared by <@${doneBy}> (age: ${moment(user.applied).fromNow(
            true
        )})${!!comment ? ` with comment: *${comment}*` : ''}.`,
    banned: (user, doneBy, comment) =>
        `${user.minecraft} <@${user.discord}> has been banned by <@${doneBy}>${
            !!comment ? ` with comment: *${comment}*` : ''
        }. Request age: ${moment(user.applied).fromNow(true)}.`,
    pending: (user, doneBy, comment, channel) => applicationInfoEmbed(channel, user, true),
    frozen: (user, doneBy, comment) =>
        `Request by ${user.minecraft} (<@${user.discord}>) has been frozen by <@${doneBy}> (age: ${moment(user.applied).fromNow(
            true
        )})${!!comment ? ` with comment *${comment}*` : ''}.`,
    suspend: (user, doneBy, comment) =>
        `Whitelist applications have been **${WhitelistValidator.applicationsOpen ? 'resumed' : 'suspended'}** by <@${doneBy}>${
            !!comment ? ` with comment: *${comment}*.` : ''
        }`,
};
