import { BaseClient, Client, Collection } from 'discord.js';
import Command, { CommandAliasesMap } from './Command';

interface DiscordClient extends Client {
    commands: Collection<string, Command>;
    commandAliases: CommandAliasesMap;
}
