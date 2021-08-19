import Command, * as Types from '../../../interfaces/Command';
import Application from '../../../interfaces/Application';
import User from '../../../models/user';

const remove: Command = {
    execute: async ({ message }: { message: Types.Message }) => {
        const application: Application = await User.findOneAndDelete({
            discord: message.author.id,
            status: 'pending',
        });

        if (application === null) {
            message.channel.send(`You don't have a pending request.`);
        } else {
            message.channel.send(`Removed your request for '${application.minecraft}'.`);
        }
    },
    help: async ({ message }: { message: Types.Message }) => {
        message.channel.send(
            `Remove your current whitelist application, only works if it's pending.\nUsage: \`neko whitelist remove\``
        );
    },
};

export default remove;
