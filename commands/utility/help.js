const insults_for_dum_dums = [
    "Wow aren't you the most hilarious Discord user ever.",
    "Hahaha me funny brain go unga bunga",
    "Raid my nuts"
];

module.exports = {
    name: 'help',
    async execute(client, interaction) {
        interaction.reply(`I can't be fucked writing a help section yet, just use the slash command GUI description thingys they're pretty neat.`, {ephemeral: true});
    },
    async execute_help(client, interaction) {
        interaction.reply(insults_for_dum_dums[Math.floor(Math.random() * insults_for_dum_dums.length)], { ephemeral: true});
    }
}