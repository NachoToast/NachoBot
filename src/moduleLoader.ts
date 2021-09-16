import fs from 'fs';
import { modules, disableAllModules } from './config.json';
import Command from './interfaces/Command';

interface StringIndexedObject {
    [index: string]: any;
}

class Module {
    private name: string; // lowercase config object key
    private longPath: string; // this path includes "src" or "build" since file system uses absolute path
    private shortPath: string; // this path doesn't, so it starts at "commands"
    private logFile: string; // log file output, e.g. "logs/moduleLoader.log"

    public submodules: Module[];
    public files: string[] = [];
    public allCommands: any[] = [];
    public validCommands: Command[] = [];
    public numSubCommands: number = 0;

    constructor(name: string, parentObj: StringIndexedObject, longPath: string, shortPath: string, logFile: string) {
        this.name = name;
        this.longPath = `${longPath}/${shortPath}/${name}`;
        this.shortPath = `${shortPath}/${name}`;
        this.logFile = logFile;

        const possibleSubmodules = getEnabledSubkeys(parentObj[name]);

        fs.appendFileSync(
            this.logFile,
            `\n[${new Date().toLocaleTimeString()}] Registering '${name}' command module (${
                possibleSubmodules.length
            } submodules)`
        );

        this.submodules = possibleSubmodules.map(
            (e) => new Module(e, parentObj[name], longPath, shortPath + '/' + name, logFile)
        );
    }

    public async promiseLoadFiles(): Promise<void> {
        return new Promise((res) => {
            res(this.loadFiles());
        });
    }

    private loadFiles() {
        try {
            const newFiles = fs
                .readdirSync(this.longPath)
                .filter((e) => e.includes('.'))
                .map((e) => `${this.shortPath}/${e}`);
            if (!newFiles.length) throw new Error(`${this.name} module has no command files`);

            this.files = newFiles;
        } catch (error) {
            fs.appendFileSync(this.logFile, `\n[${new Date().toLocaleTimeString()}] ${error}`);
        } finally {
            Promise.all(this.submodules.map((e) => e.promiseLoadFiles()));
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
                this.allCommands.push(require(`./${file}`));
            } catch (error) {
                if (error instanceof Error)
                    fs.appendFileSync(this.logFile, `\n[${new Date().toLocaleTimeString()}] ${error.message.split('\n')[0]}`);
                else fs.appendFileSync(this.logFile, `\n[${new Date().toLocaleTimeString()}] ${error}`);
            }
        }
        Promise.all(this.submodules.map((e) => e.promiseLoadFiles()));
    }

    public async promiseVerifyCommands(): Promise<void> {
        return new Promise((res) => {
            res(this.verifyCommands());
        });
    }

    private verifyCommands() {
        for (const command of this.allCommands) {
            if (typeof command !== 'object' || Array.isArray(command)) {
                fs.appendFileSync(
                    this.logFile,
                    `\n[${new Date().toLocaleTimeString()}] Invalid type of command in ${
                        this.name
                    } module, should use 'Command' interface (${this.longPath})`
                );
                continue;
            }
            if (!command?.name) {
                fs.appendFileSync(
                    this.logFile,
                    `\n[${new Date().toLocaleTimeString()}] Unnamed command in ${this.name} module (${this.longPath})`
                );
                continue;
            }
            if (!command?.execute) {
                fs.appendFileSync(
                    this.logFile,
                    `\n[${new Date().toLocaleTimeString()}] ${command.name} (from ${
                        this.name
                    } module) is missing an execute method`
                );
                continue;
            }
            if (!command?.help)
                fs.appendFileSync(
                    this.logFile,
                    `\n[${new Date().toLocaleTimeString()}] Command ${command.name} (from ${
                        this.name
                    } module) should have a help section`
                );

            if (!!command?.numSubCommands) this.numSubCommands += command.numSubCommands;

            this.validCommands.push(command);
        }

        Promise.all(this.submodules.map((e) => e.promiseLoadFiles()));
    }

    public getStats(offset: number = 0) {
        fs.appendFileSync(
            this.logFile,
            `\n[${new Date().toLocaleTimeString()}]${' '.repeat(offset)} Successfully loaded ${
                this.validCommands.length
            } commands (and ${this.numSubCommands} subcommands) from ${this.name} module, ${
                this.allCommands.length - this.validCommands.length
            } were invalid files, ${this.files.length - this.allCommands.length} were invalid command formats.`
        );
        if (!!this.submodules.length) {
            this.submodules.forEach((e) => e.getStats(offset + 4));
        }
    }
}

async function loadModulesFromConfig() {
    const subFolder = __dirname.split('\\')[__dirname.split('\\').length - 1]; // 'src' or 'build'
    const logFile = `logs/moduleLoader.log`;
    fs.writeFileSync(logFile, `[${new Date().toLocaleTimeString()}] Scanning config for enabled modules...`);

    const allModules = getEnabledSubkeys(modules).map((e) => new Module(e, modules, subFolder, 'commands', logFile));
    fs.appendFileSync(
        logFile,
        `\n[${new Date().toLocaleTimeString()}] Registered ${allModules.length} modules and ${allModules
            .map((e) => e.submodules.length)
            .reduce(
                (sum, current) => sum + current
            )} submodules.\n[${new Date().toLocaleTimeString()}] Attempting to load files...`
    );

    await Promise.all(allModules.map((e) => e.promiseLoadFiles()));

    fs.appendFileSync(
        logFile,
        `\n[${new Date().toLocaleTimeString()}] Loaded ${allModules
            .map((e) => e.files.length)
            .reduce((sum, current) => sum + current)} files.\n[${new Date().toLocaleTimeString()}] Attempting to load commands...`
    );

    await Promise.all(allModules.map((e) => e.promiseLoadCommands()));

    fs.appendFileSync(
        logFile,
        `\n[${new Date().toLocaleTimeString()}] Loaded ${allModules
            .map((e) => e.allCommands.length)
            .reduce((sum, current) => sum + current)} commands.\n[${new Date().toLocaleTimeString()}] Verifying commands...`
    );

    await Promise.all(allModules.map((e) => e.promiseVerifyCommands()));

    fs.appendFileSync(
        logFile,
        `\n[${new Date().toLocaleTimeString()}] Found ${allModules
            .map((e) => e.validCommands.length)
            .reduce((sum, current) => sum + current)} valid commands (${allModules
            .map((e) => e.numSubCommands)
            .reduce((sum, current) => sum + current)} valid submodules).\n[${new Date().toLocaleTimeString()}] Applying...`
    );

    // TODO: collection adding, alias object merging
    fs.appendFileSync(logFile, `\n[${new Date().toLocaleTimeString()}] All commands applied, showing stat report...`);
    allModules.map((e) => e.getStats());
}

const getEnabledSubkeys = (object: StringIndexedObject) => {
    return Object.keys(object).filter((e) => !!object[e]?.enabled && !object[e]?.standalone);
};

loadModulesFromConfig();
