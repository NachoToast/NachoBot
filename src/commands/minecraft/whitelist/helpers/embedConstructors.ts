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
import { Command } from '../../../../interfaces/Command';
import { User, Statuses, UserLogAction, statusDescriptions } from '../../../../models/user';
import { usages, exampleUses } from '../constants/help';
import { whitelist } from '../whitelist';
import { prefixes } from '../../../../config.json';

const colourMap: { [key in Statuses]: HexColorString } = {
    accepted: '#f0dbca',
    banned: '#542217',
    frozen: '#4275be',
    rejected: '#4275be',
    pending: '#934e6b',
};

/** If we can't find the specified users avatar (i.e. no mutual servers), fallback to this one. */
const fallBackImage = `https://cdn.discordapp.com/attachments/879001616265650207/890908743615799336/mhf_question-png.png`;

/** Profile picture for the bot. */
const profileImage = `https://cdn.discordapp.com/attachments/879001616265650207/888748564396793876/14.png`;

/** Command block image, for lists and command-specific help thumbnails. */
const technicalImage = `https://cdn.discordapp.com/attachments/879001616265650207/891185235297992714/Impulse_Command_Block.gif`;

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
    embed.setFooter(`Made ${moment(user.applied).fromNow()}`, profileImage);
    embed.setColor(colourMap[user.status]);
    embed.setThumbnail(userDiscord?.avatarURL() ?? fallBackImage);
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
export function applicationInfoEmbed(channel: TextChannel, user: User, isNew = false) {
    try {
        const userDiscord = channel.guild.members.cache.get(user.discord);
        const embed = new MessageEmbed()
            .setTitle(`${isNew ? 'New' : `${user.minecraft}'s`} Whitelist Application`)
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
            .setFooter(`Page ${page} of ${Math.ceil(total / perPage)}`, profileImage)
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

/** Command list embed, has separate basic and admin sections. */
export function commandListEmbed() {
    try {
        const normalCommands = whitelist.commands
            .filter((e) => !e?.adminOnly)
            .map((e) => `${e.name.toLowerCase()} - *${e?.description ?? 'No description found.'}*`); // apply command is upper case
        const adminCommands = whitelist.commands
            .filter((e) => !!e?.adminOnly)
            .map((e) => `${e.name} - *${e?.description ?? 'No description found.'}*`);

        const embed = new MessageEmbed()
            .setTitle(`Whitelist-Related Commands (${normalCommands.length + adminCommands.length})`)
            .setThumbnail(profileImage)
            .setColor('#4275be')
            .setDescription(
                `For command-specific help, use \`neko help whitelist <command name>\`, e.g. \`neko whitelist help apply\``
            )
            .addFields(
                { name: `Normal Commands (${normalCommands.length})`, value: normalCommands.join('\n') },
                { name: `Admin Commands (${adminCommands.length})`, value: adminCommands.join('\n') }
            );
        return embed;
    } catch (error) {
        return errorEmbed();
    }
}

/** Command help embed, gives detailed help about a single command. */
export function commandHelpEmbed(command: Command) {
    try {
        const disabled = !!command.disabled ? `\nThis command has been specifically disabled.` : ``;

        const syntaxExamples = [];

        if (!!usages[command.name]?.length) {
            for (const syntax of usages[command.name]) {
                syntaxExamples.push(`${prefixes[0]} whitelist ${command.name} ${syntax}`);
            }
        }
        const usageExamples = [];
        if (!!exampleUses[command.name]?.length) {
            for (const usage of exampleUses[command.name]) {
                usageExamples.push(`${prefixes[0]} ${usage}`);
            }
        }

        const embed = new MessageEmbed()
            .setTitle(`Whitelist "${command.name[0].toUpperCase() + command.name.slice(1)}" Command`)
            .setColor('#4275be')
            .setThumbnail(technicalImage)
            .setDescription(
                `${command?.description ?? 'No description found.'}${
                    command?.extendedDescription ? `\n${command?.extendedDescription}` : ''
                }${disabled}`
            )
            .addFields(
                { name: 'Command Syntax:', value: !!syntaxExamples.length ? syntaxExamples.join('\n') : 'None Found' },
                { name: 'Example Uses:', value: !!usageExamples.length ? usageExamples.join('\n') : 'None Found' }
            )
            .setFooter(
                !!command?.adminOnly ? 'This command is an admin-only command.' : 'Arguments in bold are admin-only.',
                profileImage
            );

        if (!!command.aliases?.length) {
            embed.addField(`Aliases: (${command.aliases.length})`, `\`${command.aliases.join('`, `')}\``);
        }

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
