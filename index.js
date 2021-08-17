const startBoot = new Date();
console.log(`${startBoot.toLocaleString()}\nBooting NachoBot...\n--------------------`);
const config = require('./config.json');
const RCON = config.modules.minecraft.rcon;

// other dependencies
const fs = require('fs');
const mongoose = require('mongoose');
//const cron = require('node-cron');
const { Rcon } = require('rcon-client');

// rcon instantiation
const rcon = new Rcon({ host: RCON.host, port: RCON.port, password: RCON.password });

if (config.modules.minecraft.enabled) {
    rcon.connect()
        .then(() => {
            console.log('RCON successfully connected.');
        })
        .catch((error) => {
            console.log(error);
            return;
        });

    // (a)mongoose instantiation
    mongoose
        .connect(config.modules.minecraft.mongodb_url, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            console.log('Mongoose successfully connected.');
        })
        .catch((error) => {
            console.log(error);
            return;
        });
}

// client instantiation
const { Client, Collection, Intents } = require('discord.js');
const intents = [
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILDS,
];
const client = new Client({ intents });

client.commands = new Collection();

// import command.js files from commands directory
function recursiveGetCommandFiles(currentPath) {
    const subItems = fs.readdirSync(currentPath);
    const subFolders = subItems.filter((e) => !e.includes('.'));
    const subFiles = subItems.filter((e) => e.endsWith('.js')).map((e) => `${currentPath}/${e}`);

    for (const subFolder of subFolders) {
        subFiles.push(...recursiveGetCommandFiles(`${currentPath}/${subFolder}`));
    }

    return subFiles;
}
let commandCount = 0;
const commandAliases = {};
const allCommandAliases = [];

const commandPaths = recursiveGetCommandFiles('commands');
for (const path of commandPaths) {
    const command = require(`./${path}`);

    if (command?.disabled === true) continue;
    if (command?.execute === undefined || command?.name === undefined) {
        console.log(`Command '${command?.name}' (${path.substring(9, path.length - 3)}) is incomplete.`);
        continue;
    }
    if (command?.module === undefined) {
        console.log(`Command '${command.name} (${path.substring(9, path.length - 3)}) is missing module field.`);
        continue;
    } else if (command?.module !== null && !config.modules[command?.module].enabled) continue;
    if (command?.help === undefined) {
        console.log(`Command '${command.name} (${path.substring(9, path.length - 3)}) has no help command.`);
    }

    client.commands.set(command.name, command);
    if (command?.aliases !== undefined) {
        for (const alias of command.aliases) {
            if (commandAliases[alias] !== undefined) {
                console.log(
                    `Command alias '${alias}' is used for both '${command.name}' and '${commandAliases[alias]}'.`
                );
                continue;
            }
            commandAliases[alias] = command.name;
            allCommandAliases.push(alias);
        }
    }
    commandCount++;
}

console.log(
    `Loaded ${commandCount} command(s), ${Object.keys(commandAliases).length} with aliases, ${
        allCommandAliases.length
    } aliases total.`
);

client.on('ready', () => {
    const finishBoot = new Date();
    console.log(`--------------------`);
    console.log(`${client.user.tag} logged in.`);
    console.log(`Boot Time: ${((finishBoot.getTime() - startBoot.getTime()) / 1000).toFixed(2)}s`);
    config.devmode ? console.log(`Development build.`) : console.log(`Live build.`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const inDevServer = config.devServers.indexOf(message.guildId) !== -1;
    if (config.devmode !== inDevServer) return;

    const [prefix, command, ...args] = message.content.split(' ');
    if (config.prefixes.indexOf(prefix) == -1) return;
    if (command === undefined) return;

    if (command === 'help') {
        if (args.length > 0) {
            const commandName = client.commands.get(args[1]);
        }
    }
    const isCommand = client.commands.get(command);
    console.log(isCommand);
});

client.login(config.devmode ? config.devDiscordToken : config.discordToken);
