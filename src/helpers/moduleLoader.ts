import { Client, Collection } from 'discord.js';
import fs from 'fs';
import { modules, disableAllModules } from '../config.json';
import { Command, DiscordClient } from '../interfaces/Command';
import intents from '../modules/intents.module';

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
    public commands: ExtendedCommandInfo[] = [];
    public numSubCommands: number = 0;

    constructor(name: string, parentObj: StringIndexedObject, longPath: string, shortPath: string, logFile: string, offset = 0) {
        this.name = name;
        this.longPath = `${longPath}/${shortPath}/${name}`;
        this.shortPath = `${shortPath}/${name}`;
        this.logFile = logFile;
        this.offset = offset;
        this.routerOnly = parentObj[name]?.routerOnly ?? false;

        const possibleSubmodules = Module.getEnabledSubkeys(parentObj[name]);

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

    public generateReport(maxOffset: number) {
        const ts = `\n[${new Date().toLocaleTimeString()}] `;
        const br = (!!this.offset ? '├' + '─'.repeat(this.offset) + ' ' : '') + `'${this.name}'`;
        const type = this.routerOnly ? 'Router' : !!this.offset ? 'Submodule' : 'Module';
        const tp = type + ' '.repeat(9 - type.length);
        const padding = 5 + maxOffset - br.length;
        const pd = ' '.repeat(padding > 0 ? padding : 0);

        fs.appendFileSync(
            this.logFile,
            `${ts}${br}${pd}│ ${tp} │ ${this.files.length} Files ${' '.repeat(3 - this.files.length.toString().length)}│ ${
                this.commands.length
            } Commands ${' '.repeat(3 - this.commands.length.toString().length)}│ ${this.numSubCommands} Subcommands ${' '.repeat(
                3 - this.numSubCommands.toString().length
            )}│ ${this.commands.map((e) => e.payload.name).join(', ')}`
        );
        this.submodules.map((e) => e.generateReport(maxOffset));
    }

    public getMaxOffset() {
        let offset = this.name.length + (!!this.offset ? this.offset + 2 : 0);
        for (const submodule of this.submodules) {
            const subOffset = submodule.getMaxOffset();
            if (submodule.getMaxOffset() > offset) offset = subOffset;
        }
        return offset;
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
        let myCommands = this.commands.length;
        for (const submodule of this.submodules) {
            myCommands += submodule.getNumAllCommands();
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
        for (const command of this.commands) {
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
        for (const command of this.commands) names.push(command.payload.name);
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

    private static fileValidator = new RegExp('^.*(?:ts|js)$');

    private findFiles() {
        try {
            const newFiles = fs
                .readdirSync(this.longPath)
                .filter((e) => Module.fileValidator.test(e))
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
                const imports: StringIndexedObject = require(`../${file}`);
                for (const payload of Object.keys(imports)) {
                    this.commands.push({ payload: imports[payload], file, fromModule: this });
                    if (!!imports[payload]?.numSubCommands) this.numSubCommands += imports[payload].numSubCommands;
                }
            } catch (error) {
                if (error instanceof Error) {
                    // if error, only get brief message, not entire stack trace
                    fs.appendFileSync(
                        this.logFile,
                        `\n[${new Date().toLocaleTimeString()}] ${error.message.split('\n')[0]} ('${file}')`
                    );
                    console.log(error.message);
                } else fs.appendFileSync(this.logFile, `\n[${new Date().toLocaleTimeString()}] ${error}`);
            }
        }
        Promise.all(this.submodules.map((e) => e.promiseLoadCommands()));
    }

    public async promiseNonDuplicateCommands(names: string[], aliases: string[]): Promise<Command[]> {
        return new Promise((res) => {
            res(this.returnNonDuplicateCommands(names, aliases));
        });
    }

    private returnNonDuplicateCommands(duplicateNames: string[], duplicateAliases: string[]) {
        const output: Command[] = [];
        for (const command of this.commands) {
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

    public static getEnabledSubkeys(object: StringIndexedObject) {
        return Object.keys(object).filter((e) => !!object[e]?.enabled && !object[e]?.standalone);
    }

    public static async loadFromConfig(client: DiscordClient) {
        const logFile = `logs/moduleLoader.log`;

        if (disableAllModules) {
            client.commands = new Collection();
            client.commandAliases = {};

            fs.writeFileSync(logFile, `\n[${new Date().toLocaleTimeString()}] All modules disabled.`);
            return;
        }

        const subFolder = __dirname.split('\\').slice(-2, -1)[0]; // 'src' or 'build'
        fs.writeFileSync(logFile, `[${new Date().toLocaleTimeString()}] Scanning config for enabled command modules...`);

        // registering
        const allModules = Module.getEnabledSubkeys(modules).map((e) => new Module(e, modules, subFolder, 'commands', logFile));
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
                .reduce(
                    (sum, current) => sum + current
                )} files.\n[${new Date().toLocaleTimeString()}] Attempting to load commands...`
        );

        // loading commands from files
        await Promise.all(allModules.map((e) => e.promiseLoadCommands()));
        fs.appendFileSync(
            logFile,
            `\n[${new Date().toLocaleTimeString()}] Loaded ${allModules
                .map((e) => e.getNumAllCommands())
                .reduce((sum, current) => sum + current)} commands, ${allModules
                .map((e) => e.getNumSubCommands())
                .reduce(
                    (sum, current) => sum + current
                )} subcommands.\n[${new Date().toLocaleTimeString()}] Checking for duplicate names and aliases...`
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

        const maxOffset = Math.max(...allModules.map((e) => e.getMaxOffset()));
        allModules.map((e) => e.generateReport(maxOffset));
    }
}

function createClient(): DiscordClient {
    const client: any = new Client({ intents });
    Module.loadFromConfig(client)
        .catch((e) => {
            console.log(e);
            process.exit();
        })
        .then((e) => console.log('All Modules Loaded'));
    return client as DiscordClient;
}

export default createClient;
