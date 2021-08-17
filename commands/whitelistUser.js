const User = require('../models/user');

const userValidation = new RegExp(/[^a-zA-Z0-9_]/, 'g'); // match anything besides a-z, A-Z, 0-9, and _

function isValidUsername(username) {
    if (typeof username !== 'string') return false;
    if (username.length < 3 || username.length > 16) return false;
    if (userValidation.test(username)) return false;
    return true;
}

module.exports = {
    name: 'whitelist',
    aliases: ['w', 'f'],
    module: 'minecraft',
    execute: async (message, args = []) => {
        if (args.length != 1) {
            message.channel.send('Please specify your Minecraft username.');
            return;
        }

        const minecraftUsername = args[0];

        if (!isValidUsername(minecraftUsername)) {
            message.channel.send(`'${minecraftUsername}' is not a valid Minecraft username.`);
            return;
        }

        const discordID = message.author.id;

        const existingUser = await User.findOne({ $or: [{ minecraft: minecraftUsername }, { discord: discordID }] });

        if (existingUser) {
            if (existingUser.discord === discordID) {
                message.channel.send(`You already have a pending whitelist application.`);
            } else {
                message.channel.send(`'${minecraftUsername}' already has a whitelist application pending.`);
            }
            return;
        }

        // do stuff
        User.create({
            minecraft: minecraftUsername,
            discord: discordID,
        });

        message.channel.send(`Successfully submitted a whitelist application for '${minecraftUsername}'`);
    },
    help: async (message) => {
        message.channel.send(
            `Submits a whitelist request for a specified username, tied to your Discord account.\nUsage: \`neko whitelist <username>\``
        );
    },
};
