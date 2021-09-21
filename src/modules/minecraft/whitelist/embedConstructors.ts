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
    // vacant: '#2a2a3a',
};

const statusDescriptions: { [key in Statuses]: string } = {
    accepted: 'Added onto the whitelist.',
    banned: 'Removed from the whitelist.',
    frozen: 'Temporarily removed from whitelist and awaiting further review.',
    pending: 'Awaiting admin review.',
    rejected: 'Rejected by an admin.',
};

// converts profile flags into a nicer format
function convertFlag(flag: UserFlagsString) {
    return flag
        .split('_')
        .map((e) => e[0] + e.slice(1).toLowerCase())
        .join(' ');
}

// adds a log field with a list to the embed
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

// account information for vetting purposes
function addVettingInfo(embed: MessageEmbed, userDiscord: GuildMember) {
    try {
        const roles = userDiscord.roles.cache.map(({ name }) => name).filter((e) => e !== '@everyone');
        const flags = (userDiscord.user.flags?.toArray() ?? []).map((e) => convertFlag(e));

        embed.addFields({
            name: 'Vetting Info:',
            value: `Account created **${moment(userDiscord.user.createdAt).fromNow()}**\nJoined **${moment(
                userDiscord.joinedAt
            ).fromNow()}**\nRoles: ${!!roles.length ? `(${roles.length}) - ${roles.join(', ')}` : 'None'}\nUnverified: ${
                userDiscord.pending ? 'Yes' : 'No'
            }\nFlags: ${!!flags.length ? `(${flags.length}) - ${flags.join(', ')}` : 'None'}`,
        });
    } catch (error) {
        console.log(error);
        embed.addField('ERROR', 'Error occurred adding vetting info.');
    }
}

// adds footer, colour, and thumbnail to the embed
function staticConstructors(embed: MessageEmbed, user: User, userDiscord: DiscordUser) {
    embed.setFooter(
        `Made ${moment(user.applied).fromNow()}`,
        'https://cdn.discordapp.com/attachments/879001616265650207/888748564396793876/14.png'
    );
    embed.setColor(colourMap[user.status]);
    embed.setThumbnail(
        userDiscord.avatarURL() ?? 'https://cdn.discordapp.com/attachments/879001616265650207/888748564396793876/14.png'
    );
}

// newApplication embed, shows vetting info and logs
export function newApplicationEmbed(channel: TextChannel, user: User, userDiscord: GuildMember) {
    try {
        const embed = new MessageEmbed()
            .setTitle(`New Whitelist Application`)
            .setDescription(`Minecraft: **${user.minecraft}**\nDiscord: <@${user.discord}>`);

        addVettingInfo(embed, userDiscord);
        staticConstructors(embed, user, userDiscord.user);
        addLogFields(embed, user.log);

        return embed;
    } catch (error) {
        console.log(error);
        return errorEmbed();
    }
}

// status embed, shows info and logs
export function applicationStatusEmbed(message: Message, user: User) {
    try {
        const userDiscord = (message.channel as TextChannel).guild.members.cache.get(user.discord);
        const embed = new MessageEmbed()
            .setTitle(`${user.minecraft}'s Application`)
            .setDescription(
                `\nStatus: **${user.status[0].toUpperCase() + user.status.slice(1)}**\n${
                    statusDescriptions[user.status]
                }\nMinecraft: **${user.minecraft}**\nDiscord: <@${user.discord}>${
                    !!userDiscord ? '' : `\nCouldn't fetch this user from cache, so heres your profile picture instead of theirs.`
                }`
            );
        staticConstructors(embed, user, userDiscord?.user ?? message.author);
        addLogFields(embed, user.log);
        return embed;
    } catch (error) {
        console.log(error);
        return errorEmbed();
    }
}

// like status embed but with vetting info
export function applicationInfoEmbed(message: Message, user: User) {
    try {
        const userDiscord = (message.channel as TextChannel).guild.members.cache.get(user.discord);

        const embed = new MessageEmbed()
            .setTitle(`${user.minecraft}'s Application'`)
            .setDescription(
                `\nStatus: **${user.status[0].toUpperCase() + user.status.slice(1)}**\n${
                    statusDescriptions[user.status]
                }\nMinecraft: **${user.minecraft}**\nDiscord: <@${user.discord}>${
                    !!userDiscord ? '' : `\nCouldn't fetch this user from cache, so heres your profile picture instead of theirs.`
                }`
            );

        if (!!userDiscord) addVettingInfo(embed, userDiscord);
        else embed.addField('Vetting Info:', "User isn't in the server.");
        staticConstructors(embed, user, userDiscord?.user ?? message.author);
        addLogFields(embed, user.log);

        return embed;
    } catch (error) {
        console.log(error);
        return errorEmbed();
    }
}

// for when a list returns a lot of people
export function massStatusEmbed(results: User[], total: number, status: Statuses, page: number = 1, perPage: number = 20) {
    try {
        const embed = new MessageEmbed()
            .setTitle(`Showing ${results.length} of ${total} ${status[0].toUpperCase() + status.slice(1)} Users`)
            .setFooter(
                `Page ${page} of ${Math.ceil(total / perPage)}`,
                'https://cdn.discordapp.com/attachments/879001616265650207/888748564396793876/14.png'
            )
            .setColor(colourMap[status]);

        const description: string[] = [];
        for (let i = 0, len = results.length; i < len; i++) {
            description.push(
                `${i + 1}. ${results[i].minecraft} (<@${results[i].discord}>) - *${moment(
                    results[i].log[0].timestamp
                ).fromNow()}*`
            );
        }

        embed.setDescription(description.join('\n'));

        return embed;
    } catch (error) {
        console.log(error);
        return errorEmbed();
    }
}

function errorEmbed(
    message: string = 'An error occured generating a full embed for this command, have an error embed instead :)'
) {
    return new MessageEmbed().setTitle('Error Occured').setDescription(message);
}
