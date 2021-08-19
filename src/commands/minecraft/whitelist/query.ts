import User from '../../../models/user';
import Application from '../../../interfaces/Application';
import Command, * as Types from '../../../interfaces/Command';
import isValidUsername from './isValidMinecraftUsername.module';
import moment from 'moment';

const query: Command = {
    execute: async ({ message, args = [] }: { message: Types.Message; args: string[] }) => {
        if (args[1] !== undefined) {
            if (!isValidUsername(args[1])) {
                message.channel.send(`'${args[1].replace('@', '')}' is not a valid Minecraft username.`);
                return;
            }

            const application: Application = await User.findOne({ minecraft: args[1] });

            if (application === null) {
                message.channel.send(`Couldn't find any request linked to user '${args[1].replace('@', '')}'.`);
            } else {
                message.channel.send(
                    `User ${args[1].replace('@', '')} currently has a ${application.status} request linked to Discord account <@${
                        application.discord
                    }>, made ${moment(application.applied).fromNow()}.`
                );
            }
            return;
        }

        const application: Application = await User.findOne({ discord: message.author.id });

        if (application === null) {
            message.channel.send(`Couldn't find any request linked to your Discord account.`);
        } else {
            message.channel.send(
                `You currently have a ${application.status} request for user '${application.minecraft}', made ${moment(
                    application.applied
                ).fromNow()}.`
            );
        }
    },
    help: async ({ message }: { message: Types.Message }) => {
        message.channel.send(
            `Check an application status for your Discord account, or optionally a Minecraft username\nUsage: \`neko whitelist query <username?>\``
        );
    },
};
export default query;
