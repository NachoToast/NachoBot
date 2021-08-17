module.exports = {
    name: 'exampleCommand', // command name
    aliases: ['e', 'f'],
    module: null, // module this command is from, must be listed in config.json or null
    disabled: false, // set to false to disable specific command

    execute: async (message, ...params) => {
        message.channel.send('This is an example command.');
        // do stuff
    },

    help: async (message) => {
        message.channel.send('A short description about what this command does.');
    },
};
