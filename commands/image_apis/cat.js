const fetch = require('node-fetch');

module.exports = {
    name: 'cat',
    async execute(client, interaction) {
        const { file } = await fetch('https://aws.random.cat/meow').then(response => response.json());
        interaction.reply(file);
    },
    async execute_help(client, interaction) {
        await interaction.reply(`This is literally the most simple command there is, if you're so ape-brained that you don't know how to use it, just type /cat, that's literally it. Consider deleting your Discord account afterwards.`, { ephemeral: true });
    }
}