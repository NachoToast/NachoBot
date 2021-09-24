// functions that involve creating embeds
import {
    GuildMember,
    HexColorString,
    Message,
    MessageEmbed,
    TextChannel,
    User as DiscordUser,
    UserFlagsString,
} from 'discord.js';
import moment from 'moment';
import { User, Statuses, UserLogAction } from '../../../models/user';

const colourMap: { [key in Statuses]: HexColorString } = {
    accepted: '#f0dbca',
    banned: '#542217',
    frozen: '#4275be',
    rejected: '#4275be',
    pending: '#934e6b',
};

const statusDescriptions: { [key in Statuses]: string } = {
    accepted: 'Added onto the whitelist.',
    banned: 'Removed from the whitelist.',
    frozen: 'Temporarily removed from whitelist and awaiting further review.',
    pending: 'Awaiting admin review.',
    rejected: 'Rejected by an admin.',
};

/** If we can't find the specified users avatar (i.e. no mutual servers), fallback to this one. */
const fallBackImage = `https://cdn.discordapp.com/attachments/879001616265650207/890908743615799336/mhf_question-png.png`;

/** Converts Discord profile flags into a nicer format. */
function convertFlag(flag: UserFlagsString) {
    return flag
        .split('_')
        .map((e) => e[0] + e.slice(1).toLowerCase())
        .join(' ');
}

/** Converts user log fields into a single embed field. */
function addLogFields(embed: MessageEmbed, logs: UserLogAction[]) {
    if (!logs.length) {
        embed.addField(`No Logs Found`, '\u200b');
        return;
    }
    let logList: string[] = [];
    for (const { doneBy, statusChangedTo, timestamp, comment } of logs) {
        const ts = moment(timestamp).fromNow();
        logList.push(`<@${doneBy}> changed status to **${statusChangedTo}** ${ts}.\nComment: *${comment}*`);
    }
    embed.addField(`Logs (${logs.length}):`, logList.join('\n'));
}

/** Adds account vetting information as a field to embed. */
function addVettingInfo(embed: MessageEmbed, guildUser: GuildMember) {
    try {
        const roles = guildUser.roles.cache.map(({ name }) => name).filter((e) => e !== '@everyone');
        const flags = (guildUser.user.flags?.toArray() ?? []).map((e) => convertFlag(e));

        embed.addFields({
            name: 'Vetting Info:',
            value: `Account created **${moment(guildUser.user.createdAt).fromNow()}**\nJoined **${moment(
                guildUser.joinedAt
            ).fromNow()}**\nRoles: ${!!roles.length ? `(${roles.length}) - ${roles.join(', ')}` : 'None'}\nUnverified: ${
                guildUser.pending ? 'Yes' : 'No'
            }\nFlags: ${!!flags.length ? `(${flags.length}) - ${flags.join(', ')}` : 'None'}`,
        });
    } catch (error) {
        console.log(error);
        embed.addField('ERROR', 'Error occurred adding vetting info.');
    }
}

/** Adds footer, colour, and thumbnail to embed. */
function staticConstructors(embed: MessageEmbed, user: User, userDiscord?: DiscordUser) {
    embed.setFooter(
        `Made ${moment(user.applied).fromNow()}`,
        'https://cdn.discordapp.com/attachments/879001616265650207/888748564396793876/14.png'
    );
    embed.setColor(colourMap[user.status]);
    embed.setThumbnail(userDiscord?.avatarURL() ?? fallBackImage);
}

/** New application embed: Has advanced profile information. */
export function newApplicationEmbed(user: User, guildUser: GuildMember) {
    try {
        const embed = new MessageEmbed()
            .setTitle(`New Whitelist Application`)
            .setDescription(`Minecraft: **${user.minecraft}**\nDiscord: <@${user.discord}>`);

        addVettingInfo(embed, guildUser);
        staticConstructors(embed, user, guildUser.user);
        addLogFields(embed, user.log);

        return embed;
    } catch (error) {
        console.log(error);
        return errorEmbed();
    }
}

/** Status embed: Has basic profile information. */
export function applicationStatusEmbed(message: Message, user: User) {
    try {
        const guildUser = (message.channel as TextChannel).guild.members.cache.get(user.discord);
        const embed = new MessageEmbed()
            .setTitle(`${user.minecraft}'s Application`)
            .setDescription(
                `\nStatus: **${user.status[0].toUpperCase() + user.status.slice(1)}**\n${
                    statusDescriptions[user.status]
                }\nMinecraft: **${user.minecraft}**\nDiscord: <@${user.discord}>`
            );
        staticConstructors(embed, user, guildUser?.user);
        addLogFields(embed, user.log);
        return embed;
    } catch (error) {
        console.log(error);
        return errorEmbed();
    }
}

/** Info embed: Has advanced profile information. */
export function applicationInfoEmbed(message: Message, user: User) {
    try {
        const userDiscord = (message.channel as TextChannel).guild.members.cache.get(user.discord);
        const embed = new MessageEmbed()
            .setTitle(`${user.minecraft}'s Application`)
            .setDescription(
                `\nStatus: **${user.status[0].toUpperCase() + user.status.slice(1)}**\n${
                    statusDescriptions[user.status]
                }\nMinecraft: **${user.minecraft}**\nDiscord: <@${user.discord}>`
            );

        if (!!userDiscord) addVettingInfo(embed, userDiscord);
        else embed.addField('Vetting Info:', "User isn't in the server.");
        staticConstructors(embed, user, userDiscord?.user);
        addLogFields(embed, user.log);
        return embed;
    } catch (error) {
        console.log(error);
        return errorEmbed();
    }
}

/** User list embed: Summary information on numerous users. */
export function massStatusEmbed(results: User[], total: number, page: number = 1, perPage: number = 20, status?: Statuses) {
    try {
        const embed = new MessageEmbed()
            .setTitle(`Showing ${results.length} of ${total} ${!status ? '' : status[0].toUpperCase() + status.slice(1)} Users`)
            .setFooter(
                `Page ${page} of ${Math.ceil(total / perPage)}`,
                `https://cdn.discordapp.com/attachments/879001616265650207/890910447979610132/latest.png`
            )
            .setColor(!status ? '#f0dbca' : colourMap[status]);

        const description: string[] = [];
        for (let i = 0, len = results.length; i < len; i++) {
            description.push(
                `${i + 1}. ${!status ? `[${results[i].status[0].toUpperCase() + results[i].status.slice(1)}] ` : ''}${
                    results[i].minecraft
                } (<@${results[i].discord}>) - *${moment(results[i].log.slice(-1)[0].timestamp).fromNow()}*`
            );
        }

        embed.setDescription(description.join('\n'));

        return embed;
    } catch (error) {
        console.log(error);
        return errorEmbed();
    }
}

/** Fallback embed if something went wrong generating the main one. */
function errorEmbed(
    message: string = 'An error occured generating a full embed for this command, have an error embed instead :)'
) {
    return new MessageEmbed().setTitle('Error Occured').setDescription(message);
}
