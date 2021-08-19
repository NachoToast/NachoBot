import Command, * as Types from '../../../interfaces/Command';
import User from '../../../models/user';
import Application from '../../../interfaces/Application';

import isAllowed from './isAllowed.module';
import isValidUsername from './isValidMinecraftUsername.module';
const clear: Command = {
    execute: async ({ message, args = [] }: { message: Types.Message; args: string[] }) => {
        if (!isAllowed(message)) return;
        if (args[1] === undefined || (!isValidUsername(args[1]) && !args[1].includes('<@'))) {
            message.channel.send(`'${args[1]}' is not a valid Minecraft username or Discord user.`);
            return;
        }

        const searchTerm = args[1].replace(/[<@!>]/g, '');

        const application: Application | null = await User.findOneAndDelete({
            $or: [{ discord: searchTerm }, { minecraft: searchTerm }],
        });

        if (application === null) {
            message.channel.send(`Couldn't find any application linked to '${args[1]}' to clear.`);
            return;
        }

        message.channel.send(
            `Cleared ${application.status} application for '${application.minecraft}' (<@${application.discord}>)${
                application.status === 'accepted'
                    ? `.\nNote that whitelist status isn't changed by the \`clear\` command, only the application.`
                    : '.'
            }`
        );
    },
    help: async ({ message }: { message: Types.Message }) => {
        message.channel.send(
            `Clears an application from the database, no matter the state. Whitelist remains unmodified.\nUsage: \`neko whitelist clear <username or discord tag> \`\nAdmin use only.`
        );
    },
};

export default clear;
