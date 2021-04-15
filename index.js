// Devmode
const devmode = false;
// Dependency declaring
const cron = require('node-cron');
const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
// Declaring config stuff, like API tokens
const config = require('./config.json');
// Defining command directories.
client.commands = new Discord.Collection();
const roleClaim = require('./commands/reactrole/role-claim');
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles){
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}
// Defining prefixes
const prefixes = ['nachobot', 'nacho','nachiii', 'nachi','neko'];

client.once('ready', () => {
    console.log('NachoBot is up :D');
    if (devmode) return;
    //statusupdate();
    cron.schedule('* */5 * * *', () => statusupdate()); // Call randomize status every 5 minutes.
    minecraftupdateinit(client);
    cron.schedule('0 0 12 * * 3', () => { // Wednesday 12pm
        wednesday();
    }, {
        scheduled: true,
        timezone: "Pacific/Auckland"
    });
    roleClaim(client);
});

async function wednesday() {
    const channel = await client.channels.fetch('413218560882507786'); // Actual
    //const channel = await client.channels.fetch('795106209946402841'); // Testing
    channel.send('https://i.kym-cdn.com/photos/images/newsfeed/001/091/264/665.jpg');
}

async function minecraftupdateinit() {
    // Minecraft Server Checking
    const coolguy = await client.users.fetch('240312568273436674');
    cron.schedule(`*/${config.server_interval} * * * * *`, () => client.commands.get('minecraft').execute(client, coolguy)) // Update minecraft server status every X seconds.
    client.commands.get('minecraft').execute(client, coolguy);

}

function statusupdate() {
    const statuses = [`Minecraft in ${client.guilds.cache.size} servers`, `with your heart`, `on ${client.guilds.cache.size} servers`, `with neko cat`, `crash the Minecraft server`, `piano`, `anything besides Destiny 2`]
    client.user.setActivity(statuses[Math.floor(Math.random() * statuses.length)], {type: 'PLAYING'});
}

client.on('message', async message => {
    if (devmode && message.guild.id != 795106209946402837) return;
    if(message.author.bot) return; // Don't go ahead if its a bot's message.
    // Commands that don't look for prefixes.
    if (message.channel.id == 814404402365857792) {message.react("👍"); return}
    if (message.channel.id == 814404402365857792) {message.react("👎"); return}
    if ((message.content.toLowerCase().startsWith("did") || message.content.toLowerCase().startsWith("doin"))
    &&
    (message.content.toLowerCase().includes("your") || message.content.toLowerCase().includes("ur") || message.content.toLowerCase().includes("ya"))
    &&
    (message.content.toLowerCase().includes("mom") || message.content.toLowerCase().includes("mum") || message.content.toLowerCase().includes("mother"))) {client.commands.get('eatmyass').execute(message); return}
    if (message.content.toLowerCase().includes("happy birthday")) {client.commands.get('birthday').execute(message); return}
    // Command that do look for prefixes.
    var prefix = ""
    for (let i = 0; i < prefixes.length; i++) {
        if (message.content.toLowerCase().startsWith(prefixes[i])) {
            prefix = prefixes[i];
            break;
        }
    }
    if (prefix == "") return;
    const args = message.content.slice(prefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();
    // Commands
    if ((command === 'ping') || (command === 'p')) {client.commands.get('ping').execute(client, message, args); return}
    if ((command === 'cat') || (command === 'c')) {client.commands.get('cat2').execute(message); return}
    if (command === 'eat' && args.includes("my" && "ass")) {client.commands.get('eatass').execute(message); return}
    if ((command === 'osu') || (command === 'o')) {client.commands.get('osu/authenticate').execute(client, message, args); return}
    if ((command === 'dan') || (command === 'san') || (command === 'sans') || (command === 'd') || (command === 's')) {client.commands.get('danbooru/authenticate').execute(client, message, command, args, debugmode); return}
    if ((prefix === 'neko') && (command === 'para')) {client.commands.get('danbooru/nekopara').execute(args, message); return}
    if ((command === 'help') || (command === 'h')) {client.commands.get('help').execute(message, args, prefixes); return}
    if ((command === 'horny') || (command === 'bonk') || (command === 'b')) {client.commands.get('horny').execute(message); return}
    if (command == "clear" && message.author.id == "240312568273436674") {
        if (!args[0]) args[0] = 10;
        args[0] = parseInt(args[0]) + 1;
        message.channel.bulkDelete(args[0])
            .then(messages => message.channel.send(`Bulk deleted ${messages.size - 1} messages.`))
    }
});

client.login(config.discord_token) // Stay away from my token u meanie >:P