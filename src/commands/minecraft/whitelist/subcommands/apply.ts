import { GuildMember, Message, TextChannel } from 'discord.js';
import { Command, DiscordClient } from '../../../../interfaces/Command';
import { discordIdTest, filterMentions, stripTagDecorations, tagsUser } from '../../../../modules/mentionFilter';
import { getSingleDBUser, makeNewApplication } from '../../../../modules/minecraft/whitelist/databaseTools';
import { getActualUsername, isValidUsername } from '../../../../modules/minecraft/whitelist/username';
import { WhitelistValidator } from '../../../../modules/minecraft/whitelist/validation';
import { WhitelistError } from '../constants/database';
import DENIED_MESSAGES from '../constants/deniedMessages';
import { devMode, modules } from '../../../../config.json';
import { newApplicationEmbed } from '../../../../modules/minecraft/whitelist/embedConstructors';

const notifyNew = modules.minecraft.whitelist.sendNewApplications;
const feedChannel = devMode
    ? modules.minecraft.whitelist.newRequestFeedChannelDev
    : modules.minecraft.whitelist.newRequestFeedChannel;

class Apply implements Command {
    public name = 'APPLY'; // uppercase so it's never actually called

    private commentFlag = 'c';
    private onBehalfFlag = 'for';

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
        if (!WhitelistValidator.applicationsOpen) {
            message.channel.send(WhitelistValidator.message());
            return;
        }

        if (this.invalidUsername(message, args)) return;

        const applicantDiscord = this.getOnBehalfOf(message, args, isAdmin);
        if (!applicantDiscord) return;

        const comment = this.getComment(message, args, isAdmin);
        if (comment === false) return;

        const minecraftUsername = await this.getVerifiedUsername(message, args[0]);
        if (minecraftUsername === false) return;

        const duplicateRequest = await this.applicationAlreadyExists(message, minecraftUsername, applicantDiscord.id);
        if (duplicateRequest) return;

        const submittedUser = await makeNewApplication(minecraftUsername, applicantDiscord.id, message.author.id, comment);

        if (submittedUser instanceof WhitelistError) {
            message.channel.send(submittedUser.message);
            return;
        }

        message.channel.send(`Successfully submitted a whitelist application linked to user '${submittedUser.minecraft}'.`);

        if (notifyNew) {
            // TODO: move this to its own module :)
            const outputChannel = client.channels.cache.get(feedChannel) as TextChannel | undefined;

            if (!!outputChannel) {
                const embed = newApplicationEmbed(submittedUser, applicantDiscord);
                outputChannel.send({ embeds: [embed] });
            }
        }
    }

    /** Returns `true` if the username is invalid, `false` otherwise. */
    private invalidUsername(message: Message, args: string[]) {
        if (!args.length) {
            message.channel.send(`Please specify a Minecraft username, e.g. \`neko whitelist NachoToast\``);
            return true;
        }
        if (!isValidUsername(args[0])) {
            DENIED_MESSAGES.INVALID_MINECRAFT_USERNAME(message, args[0]);
            return true;
        }

        return false;
    }

    /** Returns the GuildMember who is the subject of the application, or `false` if invalid. */
    private getOnBehalfOf(message: Message, args: string[], isAdmin: boolean) {
        const attemptedOnBehalf = args.indexOf(this.onBehalfFlag) + 1;
        if (!attemptedOnBehalf) return message.member as GuildMember;
        if (!isAdmin) {
            DENIED_MESSAGES.NO_PERMISSION(message);
            return false;
        }
        if (!args[attemptedOnBehalf]) {
            DENIED_MESSAGES.NOT_SPECIFIED_USER(message);
            return false;
        }

        if (!discordIdTest.test(args[attemptedOnBehalf]) && !tagsUser.test(args[attemptedOnBehalf])) {
            DENIED_MESSAGES.INVALID_DISCORD_ID(message, args[attemptedOnBehalf]);
            return false;
        }

        const applicantDiscordID = stripTagDecorations(args[attemptedOnBehalf]);

        if (applicantDiscordID === message.author.id) {
            DENIED_MESSAGES.ID_IS_YOURS(message);
            return false;
        }

        const applicantGuildMember = (message.channel as TextChannel).guild.members.cache.get(applicantDiscordID);

        if (!applicantGuildMember) {
            DENIED_MESSAGES.NOT_IN_SERVER(message, applicantDiscordID);
            return false;
        }

        if (applicantGuildMember.user.bot) {
            DENIED_MESSAGES.IS_BOT(message, applicantDiscordID);
            return false;
        }

        return applicantGuildMember;
    }

    /** Gets the comment specified if applicable, or `false` if invalid. */
    private getComment(message: Message, args: string[], isAdmin: boolean) {
        const attemptedComment = args.indexOf(this.commentFlag) + 1;
        if (!attemptedComment) return;
        if (!isAdmin) {
            DENIED_MESSAGES.NO_PERMISSION(message);
            return false;
        }
        if (!args[attemptedComment]) {
            DENIED_MESSAGES.NOT_SPECIFIED_COMMENT(message);
            return false;
        }

        const behalfIndex = args.indexOf(this.onBehalfFlag) + 1;
        if (!behalfIndex) {
            DENIED_MESSAGES.COMMENT_BUT_NO_BEHALF(message);
            return false;
        }

        if (behalfIndex > attemptedComment) {
            DENIED_MESSAGES.COMMENT_NOT_END_ARG(message);
            return false;
        }

        return args.slice(attemptedComment).join(' ');
    }

    /** Returns `false` if the username is nonexistant, already whitelisted, or some other error,
     * otherwise it returns the case sensitive Minecraft username. */
    private async getVerifiedUsername(message: Message, username: string) {
        const [success, actualUsername] = await getActualUsername(username);

        if (success) return actualUsername;

        message.channel.send(actualUsername);
        return false;
    }

    /** Returns `true` if an entry with that Minecraft username or Discord ID already exists, `false` otherwise. */
    private async applicationAlreadyExists(message: Message, minecraft: string, discord: string) {
        console.log(minecraft, discord);
        const [existingMC, existingDiscord] = await Promise.all([getSingleDBUser(minecraft), getSingleDBUser(discord)]);

        if (existingDiscord instanceof WhitelistError) {
            message.channel.send(existingDiscord.message);
            return true;
        }
        if (existingMC instanceof WhitelistError) {
            message.channel.send(existingMC.message);
            return true;
        }

        if (!!existingDiscord) {
            DENIED_MESSAGES.DISCORD_TAKEN(message, discord, existingDiscord.minecraft);
            return true;
        }
        if (!!existingMC) {
            DENIED_MESSAGES.MINECRAFT_TAKEN(message, minecraft);
            return true;
        }

        return false;
    }
}

export const apply = new Apply();
