import { Command, CommandCollection, RouterCommands, StringIndexed } from '../interfaces/Command';
import { Collection } from 'discord.js';
// this helper is for command routers to use to load their subcommands, similar to how moduleLoader loads client commands

/*
✅ loads all command types (export const, export default)
✅ loads aliases and maps them to command names
❌ checks for duplicate names and aliases
❌ make sure required methods (execute, name) are present
*/

function loadSubCommands(commandList: Command[]): [CommandCollection, StringIndexed] {
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

export default loadSubCommands;
