const startBoot = new Date();
console.log(`${startBoot.toLocaleString()}\nBooting NachoBot...\n--------------------`);

import * as config from './config.json';
import { blacklistedUsers } from './blacklistedUsers.json';
const RCON = config.modules.minecraft.rcon;

// other dependencies
import fs from 'fs';
import mongoose from 'mongoose';
import { Rcon } from 'rcon-client';
import Command from './interfaces/Command';
import filterMessage from './modules/mentionFilter.module';

// rcon instantiation
const isMinecraftModuleEnabled: boolean = config.modules.minecraft.enabled;
let rcon: Rcon;
// minecraft module
if (isMinecraftModuleEnabled) {
    rcon = new Rcon({ host: RCON.host, port: RCON.port, password: RCON.password });
    // rcon connection
    rcon.connect()
        .then(() => {
            console.log('RCON successfully connected.');
        })
        .catch((error: Error) => {
            console.log(error);
            process.exit();
        });

    // (a)mongoose connection
    mongoose
        .connect(config.modules.minecraft.mongodb_url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        })
        .then(() => {
            console.log('Mongoose successfully connected.');
        })
        .catch((error: Error) => {
            console.log(error);
            process.exit(1);
        });
}

// client instantiation
import { Client, Collection, Message } from 'discord.js';
import intents from './modules/intents.module';
const client: any = new Client({ intents });

// command loading
client.commands = new Collection();
const allModules: {
    [index: string]: any;
} = config.modules;
const enabledModules: string[] = Object.keys(config.modules).filter((e) => allModules[e]?.enabled === true);

console.log(`Loading ${enabledModules.length} modules.`);

let commandCount: number = 0;
let subCommandCount: number = 0;
let commandsWithAliases: number = 0;
let allCommandAliases: number = 0;
const commandAliases: { [name: string]: string } = {};

// loading module files
const subFolder = __dirname.split('\\')[__dirname.split('\\').length - 1];

for (const moduleName of enabledModules) {
    const subFiles: string[] = fs.readdirSync(`${subFolder}/commands/${moduleName}`).filter((e) => e.includes('.'));
    for (const file of subFiles) {
        const command = require(`./commands/${moduleName}/${file}`);

        if (command?.disabled === true) continue;
        if (command?.execute === undefined || command?.help === undefined) {
            console.log(`Command '${moduleName}' (${moduleName}/${file}) is incomplete.`);
            continue;
        }

        if (command?.subCommands !== undefined) subCommandCount += command.subCommands;

        client.commands.set(command.name, command);
        commandCount++;

        if (command?.aliases !== undefined) {
            commandsWithAliases++;
            for (const alias of command.aliases) {
                if (commandAliases[alias] !== undefined) {
                    console.log(`Command alias '${alias}' is used for both '${command.name}' and '${commandAliases[alias]}'.`);
                    continue;
                }

                commandAliases[alias] = command.name;
                allCommandAliases++;
            }
        }
    }
}

console.log(
    `Loaded ${commandCount} commands, ${subCommandCount} subcommands; ${commandsWithAliases} with aliases, ${allCommandAliases} aliases total.`
);

client.on('ready', () => {
    const finishBoot = new Date();
    console.log(`--------------------`);
    console.log(`${client.user.tag} logged in.`);
    console.log(`Boot Time: ${((finishBoot.getTime() - startBoot.getTime()) / 1000).toFixed(2)}s`);
    console.log(`${config.devMode ? 'Development' : 'Live'} build.`);
});

client.on('messageCreate', async (message: Message) => {
    if (message.author.bot) return;
    if (blacklistedUsers.includes(message.author.id)) return;

    const inDevServer: boolean = config.devServers.indexOf(message.guildId || config.devServers[0]) !== -1;
    if (config.devMode !== inDevServer) return;

    const [prefix, command, ...args] = message.content.split(' ');

    if (config.prefixes.indexOf(prefix) == -1) return;

    let foundCommand: Command | undefined;

    foundCommand = client.commands.get(command.toLowerCase()) ?? client.commands.get(commandAliases[command.toLowerCase()]);

    const params = { client, message, rcon, args };

    // if running 'neko help <arg>' and not 'neko help help'
    if (foundCommand?.name === 'help' && args.length > 0 && args[0] !== 'help') {
        foundCommand = client.commands.get(args[0].toLowerCase()) ?? client.commands.get(commandAliases[args[0].toLowerCase()]);
        if (foundCommand === undefined) {
            message.channel.send(`No help found for '${filterMessage(args[0])}'.`);
            return;
        }
        return foundCommand.help({ ...params });
    }

    if (foundCommand === undefined) {
        if (!config.devMode) return;
        message.channel.send(`Command '${filterMessage(command)}' not found.`);
        return;
    }

    foundCommand.execute({ ...params });
});

client.login(config.devMode ? config.devDiscordToken : config.discordToken);
