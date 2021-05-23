const ping_responses = [
    'Pongers!',
    'Pingchomp!',
    'Pagman',
    'Hello Bitch',
    'Exiting the Obamasphere',
    'Lefa'
]

module.exports = {
    name: 'ping',
    async execute(client, interaction) {
        extras = "";
        if (interaction.options.length > 0 && interaction.options[0].name === 'flags') {
            switch (interaction.options[0].value) {
                case "l":
                    extras += `\nLatency: ${Math.abs(Date.now() - interaction.createdTimestamp)}ms - API Latency: ${Math.round(client.ws.ping)}ms`;
                    break;
                case "mc":
                    extras += `\nMinecraft ping coming soon™`;
                default:
                    break;
            }
        }
        interaction.reply(`${ping_responses[Math.floor(Math.random() * ping_responses.length)]} ${extras}`);
    },
    async execute_help(client, interaction) {
        await interaction.reply(`It's a ping command, literally just type '/ping', why are you even searching up help for this you dumbass.\nYou can add flags like **latency** (displays ping) and **minecraft** (checks Minecraft server status), but why would you even know what the word 'flags' means if you can't use a ping command without help.`, { ephemeral: true });
    }
}