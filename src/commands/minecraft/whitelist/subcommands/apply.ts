import { GuildMember, Message, TextChannel } from 'discord.js';
import { Command, DiscordClient } from '../../../../interfaces/Command';
import { discordIdTest, stripTagDecorations, tagsUser } from '../../../../modules/mentionFilter';
import { getSingleDBUser, makeNewApplication } from '../helpers/databaseTools';
import { getActualUsername, isValidUsername } from '../helpers/username';
import { isInServer, WhitelistValidator } from '../helpers/validation';
import { WhitelistError } from '../constants/database';
import { DENIED_MESSAGES, OUTPUT_MESSAGES } from '../constants/messages';
import { createNotification } from '../helpers/notification';
import { getComment, behalfFlag } from '../helpers/flags';
class Apply implements Command {
    public name = 'apply';

    public adminOnly = false;
    public description = 'Makes a whitelist application.';
    public extendedDescription = `Explicitly specifying \`apply\` isn't necessary, you can just put your username there instead.\nAdmins may create whitelist applications on behalf of other users using the \`${behalfFlag}\` flag.`;

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
        if (!isInServer(client, message.author.id)) {
            DENIED_MESSAGES.NOT_IN_SERVER(message);
            return;
        }

        if (!WhitelistValidator.applicationsOpen) {
            message.channel.send(WhitelistValidator.message());
            return;
        }

        if (this.invalidUsername(message, args)) return;

        const applicantDiscord = this.getOnBehalfOf(message, args, isAdmin);
        if (!applicantDiscord) return;

        const comment = getComment(message, args, isAdmin, behalfFlag);
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

        OUTPUT_MESSAGES.MADE_NEW_REQUEST(message, minecraftUsername, applicantDiscord.id);

        createNotification(client, 'pending', submittedUser, message.author.id, comment);
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
        const attemptedOnBehalf = args.indexOf(behalfFlag) + 1;
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
            DENIED_MESSAGES.TARGET_NOT_IN_SERVER(message, applicantDiscordID);
            return false;
        }

        if (applicantGuildMember.user.bot) {
            DENIED_MESSAGES.IS_BOT(message, applicantDiscordID);
            return false;
        }

        return applicantGuildMember;
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
