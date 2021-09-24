import { Command, CommandCollection, StringIndexed } from '../interfaces/Command';
import { Collection } from 'discord.js';
// this helper is for command routers to use to load their subcommands, similar to how moduleLoader loads client commands.

/*
✅ loads aliases and maps them to command names
❌ checks for duplicate names and aliases
*/

/** A WIP command that loads an array of command-like objects into 2 objects: a collection of (`name`, `command`), and an object of (`alias`: `name`). Does NOT check for duplicate names/aliases (yet). */
export default function loadSubCommands(commandList: Command[]): [CommandCollection, StringIndexed] {
    const commandMap: CommandCollection = new Collection();
    const aliasMap: StringIndexed = {};
    for (const command of commandList) {
        commandMap.set(command.name, command);
        if (!!command.aliases?.length) {
            for (const alias of command.aliases) {
                aliasMap[alias] = command.name;
            }
        }
    }
    return [commandMap, aliasMap];
}
