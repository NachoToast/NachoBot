import fs from 'fs';
import { Client, Collection } from 'discord.js';
import config, { disableAllModules, silentModuleLoad } from './config.json';
import Command, { CommandAliasesMap } from './interfaces/Command';
import { DiscordClient } from './interfaces/Client';
import intents from './modules/intents.module';
import './moduleLoader';

interface ModuleInfo {
    name: string;
    number: number;
    total: number;
}

interface ResolvedCommand {
    name: string;
    path: string;
    resolved: boolean;
    reason?: string;
    subCommandsCount?: number;
    payload?: Command;
}

const modules: { [index: string]: any } = config.modules;

const subFolder = __dirname.split('\\')[__dirname.split('\\').length - 1] + '/commands';

const createClient = (): DiscordClient => {
    const client: any = new Client({ intents });
    // loadCommands(client);
    return client as DiscordClient;
};

const loadCommands = async (client: DiscordClient) => {
    const commands: Collection<string, Command> = new Collection();
    const commandAliases: CommandAliasesMap = {};

    if (!disableAllModules) {
        const enabledModules = getEnabledSubkeys(modules);
        const modulesToLoad: Promise<ResolvedCommand>[] = [];
        for (let i = 0, len = enabledModules.length; i < len; i++) {
            const moduleInfo: ModuleInfo = {
                name: enabledModules[i],
                number: i,
                total: len,
            };

            // "routerOnly" modules don't have any commands themselves, and only exist as parents for other sub-modules
            if (!modules[enabledModules[i]]?.routerOnly) {
                modulesToLoad.push(
                    new Promise((res) => {
                        res(getAllFiles(moduleInfo, undefined));
                    })
                );
            }

            loadSubModules(modulesToLoad, enabledModules[i], moduleInfo);
        }

        const resolvedCommands: ResolvedCommand[] = await Promise.all(modulesToLoad);

        const successfulCommands = resolvedCommands.filter((e) => !!e.resolved);
        const failedCommands = resolvedCommands.filter((e) => !e.resolved);

        // log commands that had errors
        if (!silentModuleLoad) {
            for (const failed of failedCommands) {
                console.log(
                    `[Module Loader] Failed to load ${failed.name[0].toUpperCase() + failed.name.slice(1)} module: ${
                        failed?.reason ?? 'Unknown error.'
                    }`
                );
            }
        }

        // load non-erroneous commands
        let numSubCommands = 0;
        for (const { name, payload, subCommandsCount } of successfulCommands) {
            if (!!subCommandsCount) numSubCommands += subCommandsCount;
            if (!payload || !payload?.name) {
                console.log(`[Module Loader] Fatal error occured loading ${name} command.`);
                continue;
            }
            commands.set(payload.name, payload);

            if (!!payload?.aliases) {
                for (const alias of payload.aliases) {
                    if (commandAliases[alias] !== undefined) {
                        // alias is already in use
                        console.log(
                            `[Module Loader] Alias '${alias}' of ${name} module is already in use for '${commandAliases[alias]}' command.`
                        );
                        continue;
                    }
                    commandAliases[alias] = payload.name;
                }
            }
        }

        !silentModuleLoad &&
            console.log(
                `[Module Loader] Loaded ${successfulCommands.length}/${resolvedCommands.length} commands (and ${numSubCommands} sub-commands).`
            );
    }
    client.commands = commands;
    client.commandAliases = commandAliases;
};

const loadSubModules = (loadList: Promise<ResolvedCommand>[], module: string, moduleInfo: ModuleInfo) => {
    const enabledSubmodules = getEnabledSubkeys(modules[module]);

    for (let j = 0, len2 = enabledSubmodules.length; j < len2; j++) {
        const submoduleInfo: ModuleInfo = {
            name: enabledSubmodules[j],
            number: j,
            total: len2,
        };

        loadList.push(
            new Promise((res) => {
                res(getAllFiles(moduleInfo, submoduleInfo));
            })
        );
    }
};

const getEnabledSubkeys = (object: { [index: string]: any }) => {
    // "standalone" modules don't have their own commands, and are instead used by other commands
    return Object.keys(object).filter((e) => !!object[e]?.enabled && !object[e]?.standalone);
};

const getAllFiles = async (mod: ModuleInfo, subMod: ModuleInfo | undefined): Promise<ResolvedCommand> => {
    const mainString = `[Module Loader] (${mod.number + 1}/${mod.total}) ${mod.name[0].toUpperCase() + mod.name.slice(1)}`;
    const subString = !!subMod
        ? ` (${subMod.number + 1}/${subMod.total}) - ${subMod.name[0].toUpperCase() + subMod.name.slice(1)}`
        : '';
    !silentModuleLoad && console.log(mainString + subString);
    const commandPath = `${subFolder}/${mod.name}${!!subMod ? `/${subMod.name}` : ''}`;
    const output: ResolvedCommand = {
        name: `${mod.name}${!!subMod ? ` (${subMod.name})` : ''}`,
        path: commandPath,
        resolved: false,
    };
    try {
        const files = fs.readdirSync(commandPath).filter((e) => e.includes('.'));
        if (!!files.length) {
            for (const file of files) {
                console.log(file);
            }
            const command = require(`./commands/${mod.name}${!!subMod ? `/${subMod.name}` : ''}/index`);
            [output.resolved, output.reason, output.subCommandsCount] = verifyCommand(command);
            output.payload = command;
        } else {
            output.resolved = false;
            output.reason = 'No files found.';
        }
    } catch (error) {
        output.resolved = false;
        output.reason = 'Folder not found.';
    }
    return output;
};

const verifyCommand = (command: Command): [boolean, string | undefined, number] => {
    const subCommandsCount = command?.numSubCommands ?? 0;
    if (!!command?.numSubCommands) {
        if (
            typeof command.numSubCommands !== 'number' ||
            Number.isInteger(command.numSubCommands) ||
            command.numSubCommands <= 0
        ) {
            return [false, `Invalid number of sub-commands (${command.numSubCommands}).`, subCommandsCount];
        }
    }
    if (!command?.execute) {
        return [false, "Missing 'execute' method.", subCommandsCount];
    }
    if (!command?.name) {
        return [false, "Missing 'name' property.", subCommandsCount];
    }
    return [true, undefined, subCommandsCount];
};

export default createClient;
