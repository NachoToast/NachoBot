const { Client, Intents, Collection } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const config = require ('./config.json');
const boot_time = new Date().getTime();
const slash_commands = require('./slash_commands.json');
const fs = require('fs');
const reactpool = ['🥳', '💜', '<a:ratJAM:797566731748638741>', '<a:headbang:604895069161521175>', '<a:angeryping:555295819314757632>', '<:respekt:598110434893234186>', '<:obama:610371105219280896>', '<:PogO:791539032735088641>', '<:PogU:764740680525676544>'];

client.commands = new Collection();
const command_folders = fs.readdirSync('./commands');
for (const folder of command_folders) {
    const command_files = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
    for (const file of command_files) {
        const command = require(`./commands/${folder}/${file}`);
        client.commands.set(command.name, command);
    }
}

client.on('ready', () => {
    const boot_finish = new Date();
    console.log(`---\n${boot_finish.toLocaleString()}`);
    console.log(`Logged in as ${client.user.tag}!`);
    console.log(`Boot time: ${((boot_finish.getTime() - boot_time) / 1000 ).toFixed(2)}s`);
});

client.on('message', async message => {
    if (message.author.bot) return;

    if (message.mentions.members.map(e => e.nickname).filter(e => e !== null).some(e => e.toLowerCase().includes("happy birthday")) || message.content.toLowerCase().includes("happy birthday")) {
        message.react(reactpool[Math.floor(Math.random() * reactpool.length)]);
        return;
    }

	if (message.content.toLowerCase().startsWith('nachobot deploy')) {
        if (!client.application?.owner) await client.application?.fetch();

        if (message.author.id !== client.application?.owner.id) {
            message.channel.send(`You don't have the balls to do that.`);
            return;
        }
		await client.guilds.cache.get('795106209946402837')?.commands.set(slash_commands);
        message.channel.send(`Deployed ${slash_commands.length} slash commands 😎`);
        if (message.content.toLowerCase().includes('all')) {
            await client.application?.commands.create(slash_commands);
            message.channel.send(`Global deploy successfull, poggers.`);
        }
        return;
	}

    if (message.content.toLowerCase().startsWith('nachobot')) {
        message.reply(`Look here, you ape-brained clown, you absolute idiot, you troglodyte of a human being. Responding to normal commands is extremely old. Discord had the brains to realize that when bots are choosing more prefixes than the average CIA employee something needed to change. Lo and behold bots now respond ***directly*** to slash commands.\nTry it, I dare you, start typing /ping or /help or *any* shitty command and allow your boomer eyes to see what comes up. Fuck you 🥰`);
    }

    //message.reply(message.content);
});

client.on('interaction', async interaction => {
    if (!interaction.isCommand()) return;
    if (interaction.user.bot) {
        interaction.reply(`No.`);
        return;
    }

    if (interaction.commandName === 'help' && interaction?.options.length > 0) var helpmode = true;
    else helpmode = false;
    
    if (helpmode) var command = client.commands.get(interaction.options[0].value);
    else var command = client.commands.get(interaction.commandName);

    try {
        if (helpmode) await command.execute_help(client, interaction);
        else await command.execute(client, interaction);
    } catch (err) {
        if (err instanceof TypeError && err.message === 'Cannot read property \'execute_help\' of undefined') {
            interaction.reply(`This command '${interaction.options[0].value}' doesn't exist, why did you even type help for it in the first place?`, { ephemeral: true});
            return;
        }
        if (err instanceof TypeError && err.message === 'Cannot read property \'execute\' of undefined') {
            console.log(`${new Date().toLocaleString()}: Missing command requested: '${interaction.commandName}'`);
            interaction.reply(`This command doesn't appear to exist, unlucky.`, { ephemeral: true});
            return;
        }
        if (err instanceof TypeError && err.message === 'command.execute_help is not a function') {
            console.log(`${new Date().toLocaleString()}: Missing help subcommand: ${interaction.options[0].value}`);
            interaction.reply(`This command doesn't have a help section, enjoy the guess and check.`, { ephemeral: true});
            return;
        }
        console.log(`${new Date().toLocaleString()}: Unknown error during command execution: ${interaction.commandName}.`);
        if (interaction.options.length > 0) console.log(`Options: ${interaction.options.map(e => `\n${e.name}: ${e.value} (${e.type.toLowerCase()})`)}`)
        console.log(err);
        interaction.reply(`You somehow caused an error that I have never seen before, well done shitass.`, { ephemeral: true });
    }
})

client.login(config.discord_token);
// https://discord.com/api/oauth2/authorize?client_id=845829005805617193&permissions=8&scope=applications.commands%20bot