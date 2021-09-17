import { Client, Collection } from 'discord.js';
import fs from 'fs';
import { modules, disableAllModules } from './config.json';
import { DiscordClient } from './interfaces/Client';
import Command, { CommandAliasesMap } from './interfaces/Command';
import intents from './modules/intents.module';

interface StringIndexedObject {
    [index: string]: any;
}

interface ExtendedCommandInfo {
    payload: Command;
    file: string;
    fromModule: Module;
}

class Module {
    private name: string; // lowercase config object key
    private longPath: string; // this path includes "src" or "build" since file system uses absolute path
    private shortPath: string; // this path doesn't, so it starts at "commands"
    private logFile: string; // log file output, e.g. "logs/moduleLoader.log"
    private offset: number; // dictates indentation of logging text, with steps of 4 representing how nested a module is
    // e.g 0 = module, 4 = submodule, 8 = subsubmodule, etc...
    private routerOnly: boolean; // routeronly (sub)modules dont have their own commands, and exist only to provide a home for other submodules

    public submodules: Module[];
    public files: string[] = [];
    public allCommands: ExtendedCommandInfo[] = [];
    public validCommands: ExtendedCommandInfo[] = [];
    public numSubCommands: number = 0;

    constructor(name: string, parentObj: StringIndexedObject, longPath: string, shortPath: string, logFile: string, offset = 0) {
        this.name = name;
        this.longPath = `${longPath}/${shortPath}/${name}`;
        this.shortPath = `${shortPath}/${name}`;
        this.logFile = logFile;
        this.offset = offset;
        this.routerOnly = parentObj[name]?.routerOnly ?? false;

        const possibleSubmodules = getEnabledSubkeys(parentObj[name]);

        fs.appendFileSync(
            this.logFile,
            `\n[${new Date().toLocaleTimeString()}]${!!offset ? ' ├' + '─'.repeat(offset) : ''} Registered '${name}' ${
                !!offset ? 'submodule' : 'module'
            }${
                !!possibleSubmodules.length
                    ? ` (${possibleSubmodules.length} submodule${possibleSubmodules.length > 1 ? 's' : ''})`
                    : ''
            }`
        );

        this.submodules = possibleSubmodules.map(
            (e) => new Module(e, parentObj[name], longPath, shortPath + '/' + name, logFile, offset + 4)
        );
    }

    public generateReport() {
        fs.appendFileSync(
            this.logFile,
            `\n[${new Date().toLocaleTimeString()}]${!!this.offset ? ' ├' + '─'.repeat(this.offset) : ''} '${this.name}' ${
                !!this.offset ? 'Submodule' : 'Module'
            } | ${this.files.length} Files │ ${this.allCommands.length} Commands | ${
                this.validCommands.length
            } Valid Commands │ ${this.numSubCommands} Subcommands`
        );
        this.submodules.map((e) => e.generateReport());
    }

    // gets the number of submodules in this module and all of its submodules
    public getNumSubmodules() {
        let mySubmodules = 0;
        for (const submodule of this.submodules) {
            mySubmodules += submodule.getNumSubmodules() + 1;
        }
        return mySubmodules;
    }

    // gets the number of files in this module and all of its submodules
    public getNumFiles() {
        let myFiles = this.files.length;
        for (const submodule of this.submodules) {
            myFiles += submodule.getNumFiles();
        }
        return myFiles;
    }

    // gets the number of (all) commands in this module and all of its submodules
    public getNumAllCommands() {
        let myCommands = this.allCommands.length;
        for (const submodule of this.submodules) {
            myCommands += submodule.getNumAllCommands();
        }
        return myCommands;
    }

    // gets the number of valid commands in this module and all of its submodules
    public getNumValidCommands() {
        let myCommands = this.validCommands.length;
        for (const submodule of this.submodules) {
            myCommands += submodule.getNumValidCommands();
        }
        return myCommands;
    }

    // gets number of sub commands in this module and all of its submodules
    public getNumSubCommands() {
        let subCommandCount = this.numSubCommands;
        for (const submodule of this.submodules) {
            subCommandCount += submodule.getNumSubCommands();
        }
        return subCommandCount;
    }

    public getAllAliases() {
        const aliases: string[] = [];
        for (const command of this.validCommands) {
            if (!!command?.payload?.aliases?.length) {
                aliases.push(...command.payload.aliases);
            }
        }
        for (const submodule of this.submodules) {
            aliases.push(...submodule.getAllAliases());
        }
        return aliases;
    }

    public getAllNames() {
        const names: string[] = [];
        for (const command of this.validCommands) names.push(command.payload.name);
        for (const submodule of this.submodules) {
            names.push(...submodule.getAllNames());
        }
        return names;
    }

    public async promiseFindFiles(): Promise<void> {
        return new Promise((res) => {
            res(this.findFiles());
        });
    }

    private findFiles() {
        try {
            const newFiles = fs
                .readdirSync(this.longPath)
                .filter((e) => e.includes('.'))
                .map((e) => `${this.shortPath}/${e}`);

            if (!newFiles.length && !this.routerOnly) throw new Error(`'${this.name}' module has no command files`);

            if (newFiles.length > 10) {
                fs.appendFileSync(
                    this.logFile,
                    `\n[${new Date().toLocaleTimeString()}] '${this.name}' module has lots of command files (${
                        newFiles.length
                    }), consider using submodules or subcommands`
                );
            }

            this.files = newFiles;
        } catch (error) {
            fs.appendFileSync(this.logFile, `\n[${new Date().toLocaleTimeString()}] ${error}`);
        } finally {
            Promise.all(this.submodules.map((e) => e.promiseFindFiles()));
        }
    }

    public async promiseLoadCommands(): Promise<void> {
        return new Promise((res) => {
            res(this.loadCommands());
        });
    }

    private loadCommands() {
        for (const file of this.files) {
            try {
                const payload: Command = require(`./${file}`);
                this.allCommands.push({ payload, file, fromModule: this });
            } catch (error) {
                if (error instanceof Error) {
                    // if error is by fs, only get the first line since the other ones include the whole stack trace, which is unnecessary
                    fs.appendFileSync(this.logFile, `\n[${new Date().toLocaleTimeString()}] ${error.message.split('\n')[0]}`);
                } else fs.appendFileSync(this.logFile, `\n[${new Date().toLocaleTimeString()}] ${error}`);
            }
        }
        Promise.all(this.submodules.map((e) => e.promiseLoadCommands()));
    }

    public async promiseVerifyCommands(): Promise<void> {
        return new Promise((res) => {
            res(this.verifyCommands());
        });
    }

    private verifyCommands() {
        for (const command of this.allCommands) {
            if (Module.commandIsValid(command, this.logFile)) {
                this.validCommands.push(command);
                if (!!command.payload?.numSubCommands) this.numSubCommands += command.payload.numSubCommands;
            }
        }

        Promise.all(this.submodules.map((e) => e.promiseVerifyCommands()));
    }

    private static commandIsValid(command: ExtendedCommandInfo, logFile: string) {
        if (!Object.keys(command.payload).length) {
            fs.appendFileSync(logFile, `\n[${new Date().toLocaleTimeString()}] '${command.file}' does not have any content`);
            return false;
        }
        if (typeof command.payload?.name !== 'string') {
            fs.appendFileSync(
                logFile,
                `\n[${new Date().toLocaleTimeString()}] '${command.file}' file must have a name string, got '${typeof command
                    .payload?.name}'`
            );
            return false;
        }
        if (command.payload?.name.includes(' ')) {
            fs.appendFileSync(
                logFile,
                `\n[${new Date().toLocaleTimeString()}] '${
                    command.payload.name
                }' is an invalid command name because it contains spaces ('${command.file}')`
            );
            return false;
        }
        if (typeof command.payload?.execute !== 'function') {
            fs.appendFileSync(
                logFile,
                `\n[${new Date().toLocaleTimeString()}] '${
                    command.payload.name
                }' should have execute method, got '${typeof command.payload?.execute}' ('${command.file}')`
            );
            return false;
        }
        if (typeof command.payload?.help !== 'function') {
            fs.appendFileSync(
                logFile,
                `\n[${new Date().toLocaleTimeString()}] '${
                    command.payload.name
                }' should have a help method, these are optional but recommended ('${command.file})'`
            );
        }
        return true;
    }

    public async promiseNonDuplicateCommands(names: string[], aliases: string[]): Promise<Command[]> {
        return new Promise((res) => {
            res(this.returnNonDuplicateCommands(names, aliases));
        });
    }

    private returnNonDuplicateCommands(duplicateNames: string[], duplicateAliases: string[]) {
        const output: Command[] = [];
        for (const command of this.validCommands) {
            // alias checking
            if (!!command.payload?.aliases?.length) {
                let aliasIndex = -1;
                for (let i = 0; i < duplicateAliases.length; i++) {
                    if (command.payload.aliases.includes(duplicateAliases[i])) {
                        aliasIndex = i;
                        break;
                    }
                }
                if (aliasIndex !== -1) {
                    fs.appendFileSync(
                        this.logFile,
                        `\n[${new Date().toLocaleTimeString()}] Alias '${duplicateAliases[aliasIndex]}' already in use by '${
                            command.payload.name
                        }' command ('${command.file}')`
                    );
                    continue;
                }
            }

            // name checking
            let nameIndex = duplicateNames.indexOf(command.payload.name);
            if (nameIndex !== -1) {
                fs.appendFileSync(
                    this.logFile,
                    `\n[${new Date().toLocaleTimeString()}] Name '${duplicateNames[nameIndex]}' already in use ('${
                        command.file
                    }')`
                );
                continue;
            }

            output.push(command.payload);
        }

        for (const submodule of this.submodules) {
            output.push(...submodule.returnNonDuplicateCommands(duplicateNames, duplicateAliases));
        }
        return output;
    }
}

async function loadModulesFromConfig(client: DiscordClient) {
    const logFile = `logs/moduleLoader.log`;
    const subFolder = __dirname.split('\\')[__dirname.split('\\').length - 1]; // 'src' or 'build'
    fs.writeFileSync(logFile, `[${new Date().toLocaleTimeString()}] Scanning config for enabled command modules...`);

    // registering
    const allModules = getEnabledSubkeys(modules).map((e) => new Module(e, modules, subFolder, 'commands', logFile));
    fs.appendFileSync(
        logFile,
        `\n[${new Date().toLocaleTimeString()}] Registered ${allModules.length} modules and ${allModules
            .map((e) => e.getNumSubmodules())
            .reduce(
                (sum, current) => sum + current
            )} submodules.\n[${new Date().toLocaleTimeString()}] Attempting to find files...`
    );

    // loading files
    await Promise.all(allModules.map((e) => e.promiseFindFiles()));
    fs.appendFileSync(
        logFile,
        `\n[${new Date().toLocaleTimeString()}] Found ${allModules
            .map((e) => e.getNumFiles())
            .reduce((sum, current) => sum + current)} files.\n[${new Date().toLocaleTimeString()}] Attempting to load commands...`
    );

    // loading commands from files
    await Promise.all(allModules.map((e) => e.promiseLoadCommands()));
    fs.appendFileSync(
        logFile,
        `\n[${new Date().toLocaleTimeString()}] Loaded ${allModules
            .map((e) => e.getNumAllCommands())
            .reduce((sum, current) => sum + current)} commands.\n[${new Date().toLocaleTimeString()}] Verifying commands...`
    );

    // verifying commands syntax
    await Promise.all(allModules.map((e) => e.promiseVerifyCommands()));
    fs.appendFileSync(
        logFile,
        `\n[${new Date().toLocaleTimeString()}] Found ${allModules
            .map((e) => e.getNumValidCommands())
            .reduce((sum, current) => sum + current)} valid commands (${allModules
            .map((e) => e.getNumSubCommands())
            .reduce(
                (sum, current) => sum + current
            )} valid subcommands).\n[${new Date().toLocaleTimeString()}] Checking for duplicate names and aliases...`
    );

    // detecting duplicate names and aliases
    const duplicateNames = allModules
        .map((e) => e.getAllNames())
        .flat()
        .filter((e, i, a) => a.indexOf(e) !== i);
    const duplicateAliases = allModules
        .map((e) => e.getAllAliases())
        .flat()
        .filter((e, i, a) => a.indexOf(e) !== i);

    fs.appendFileSync(
        logFile,
        `\n[${new Date().toLocaleTimeString()}] Found ${duplicateAliases.length} duplicate aliases, ${
            duplicateNames.length
        } duplicate names.`
    );

    const nonDuplicateCommands = (
        await Promise.all(allModules.map((e) => e.promiseNonDuplicateCommands(duplicateNames, duplicateAliases)))
    ).flat();

    // add commands to client collection and alias map
    fs.appendFileSync(
        logFile,
        `\n[${new Date().toLocaleTimeString()}] ${nonDuplicateCommands.length} unique commands found, applying...`
    );
    const commands: Collection<string, Command> = new Collection();
    const commandAliases: StringIndexedObject = {};

    for (const command of nonDuplicateCommands) {
        // add aliases to map
        if (!!command?.aliases?.length) {
            for (const alias of command.aliases) {
                commandAliases[alias] = command.name;
            }
        }

        // add actual command
        commands.set(command.name, command);
    }

    client.commands = commands;
    client.commandAliases = commandAliases;

    fs.appendFileSync(
        logFile,
        `\n[${new Date().toLocaleTimeString()}] Applied ${client.commands.size} commands with ${
            Object.keys(client.commandAliases).length
        } aliases.\n[${new Date().toLocaleTimeString()}] Generating stats report...`
    );

    allModules.map((e) => e.generateReport());
}

function getEnabledSubkeys(object: StringIndexedObject) {
    return Object.keys(object).filter((e) => !!object[e]?.enabled && !object[e]?.standalone);
}

function createClient(): DiscordClient {
    const client: any = new Client({ intents });
    loadModulesFromConfig(client).then(() => console.log(client.commands));
    return client as DiscordClient;
}

createClient();
