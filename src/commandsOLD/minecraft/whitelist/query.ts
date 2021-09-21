import User from '../../../models/userOld';
import Application from '../../../interfaces/Application';
import Command, * as Types from '../../../interfaces/Command';
import isValidUsername from './isValidMinecraftUsername.module';
import moment from 'moment';
import filterMessage from '../../../modules/mentionFilter.module';

const query: Command = {
    execute: async ({ message, args = [] }: { message: Types.Message; args: string[] }) => {
        if (args[1] !== undefined) {
            let searchTerm: string;

            if (args[1].includes('<@')) {
                // args[1] is a discord mention
                searchTerm = args[1].replace(/[<@!>]/g, '');
            } else if (isValidUsername(args[1])) {
                // args[1] is an mc username
                searchTerm = args[1].toLowerCase();
            } else {
                // args[1] is defined but invalid
                message.channel.send(`'${filterMessage(args[1])}' is not a valid Minecraft username.`);
                return;
            }

            const application: Application = await User.findOne({
                $or: [{ discord: searchTerm }, { minecraft: searchTerm }],
            });

            if (application === null) {
                message.channel.send(`Couldn't find any request linked to user '${args[1]}'.`);
            } else {
                message.channel.send(
                    `Minecraft user ${application.minecraft} currently has a ${
                        application.status
                    } request linked to Discord account <@${application.discord}>, made ${moment(application.applied).fromNow()}.`
                );
            }
            return;
        }
        // args[1] is not defined = query own discord id

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
