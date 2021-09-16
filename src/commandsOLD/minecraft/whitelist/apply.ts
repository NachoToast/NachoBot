import Command, * as Types from '../../../interfaces/Command';
import User from '../../../models/user';
import { devMode, modules } from '../../../config.json';
import isValidUsername from './isValidMinecraftUsername.module';
import filterMessage from '../../../modules/mentionFilter.module';

const notifyNew: boolean = modules.minecraft.whitelist.sendNewApplications;
const feedChannel: string = devMode
    ? modules.minecraft.whitelist.newRequestFeedChannelDev
    : modules.minecraft.whitelist.newRequestFeedChannel;

const apply: Command = {
    execute: async ({ message, args = [], client }: { message: Types.Message; args: string[]; client: Types.Client }) => {
        if (args.length < 1) {
            message.channel.send('Please specify your Minecraft username.');
            return;
        }

        const minecraftUsername = args[0];

        if (!isValidUsername(minecraftUsername)) {
            message.channel.send(`'${filterMessage(minecraftUsername)}' is not a valid Minecraft username.`);
            return;
        }

        const discordID = message.author.id;
        const existingUser = await User.findOne({
            $or: [{ minecraft: minecraftUsername.toLowerCase() }, { discord: discordID }],
        });

        if (!devMode && existingUser) {
            if (existingUser.discord === discordID) {
                message.channel.send(
                    `You already have a *${existingUser.status ?? 'unknown'}* whitelist application linked to Minecraft user' ${
                        existingUser.minecraft
                    }'.`
                );
            } else {
                message.channel.send(`Minecraft user '${minecraftUsername}' has already applied via another Discord account.`);
            }
            return;
        }

        User.create({
            minecraft: minecraftUsername.toLowerCase(),
            discord: discordID,
            applied: new Date().toISOString(),
        });

        message.channel.send(`Successfully submitted a whitelist application for Minecraft user '${minecraftUsername}'.`);

        if (notifyNew) {
            const outputChannel: any | undefined = client.channels.cache.get(feedChannel);

            if (outputChannel !== undefined) {
                outputChannel.send(`New Whitelist Application: ${minecraftUsername} (<@${discordID}>)`);
            }
        }
    },
    help: async ({ message }: { message: Types.Message }) => {
        message.channel.send(
            `Submits a whitelist request for a specified username, tied to your Discord account.\nUsage: \`neko whitelist <username>\``
        );
    },
};

export default apply;
