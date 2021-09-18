const startBoot = new Date();
console.log(`${startBoot.toLocaleString()}\nBooting NachoBot...\n--------------------`);
import * as config from './config.json';
import { blacklistedUsers } from './blacklistedUsers.json';
import Command, { Params } from './interfaces/Command';
import { Message } from 'discord.js';
import filterMessage from './modules/mentionFilter.module';
import { DiscordClient } from './interfaces/Client';
import createClient from './moduleLoader';

const client: DiscordClient = createClient();

client.on('ready', () => {
    const finishBoot = new Date();
    console.log(`--------------------`);
    console.log(`${client.user?.tag} logged in.`);
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

    if (!command) {
        if (config.devMode) message.channel.send(`what?`);
        return;
    }

    const foundCommand: Command | undefined =
        client.commands.get(command.toLowerCase()) ?? client.commands.get(client.commandAliases[command.toLowerCase()]);

    if (!foundCommand) {
        if (config.devMode) message.channel.send(`Command '${filterMessage(command)}' not found.`);
        return;
    }

    const params: Params = { client, message, args };

    // neko command => args[0].execute()
    // neko command help => args[0].help()
    // neko help => help.execute()
    // neko help command => args[0].help()
    // neko help help => help.execute()

    if (foundCommand.name !== 'help') foundCommand.execute({ ...params });
    else {
        if (!!args.length) {
            const foundCommand =
                client.commands.get(args[0].toLowerCase()) ?? client.commands.get(client.commandAliases[args[0].toLowerCase()]);

            if (!foundCommand) {
                message.channel.send(`Command '${filterMessage(args[0])}' not found.`);
            } else if (!foundCommand?.help) {
                message.channel.send(`No help found for '${filterMessage(args[0])}' command.`);
            } else foundCommand.help({ ...params });
        } else client.commands.get('help')?.execute({ ...params });
    }
});

client.login(config.devMode ? config.devDiscordToken : config.discordToken);
