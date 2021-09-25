import { Client, Message, Collection } from 'discord.js';

export interface StringIndexed {
    [index: string]: string;
}

export interface RouterCommands {
    [name: string]: Command;
}

export type CommandCollection = Collection<string, Command>;
export interface Command {
    name: string;
    aliases?: string[];
    execute: Function;
    help?: Function;
    disabled?: boolean;
    numSubCommands?: number | undefined;
    commands?: CommandCollection;
    commandAliases?: StringIndexed;
    [any: string]: any;
}

export interface CommandWithHelp extends Command {
    help: Function;
}

export interface Params {
    client: Client;
    message: Message;
    args: string[];
}

export interface DiscordClient extends Client {
    commands: Collection<string, Command>;
    commandAliases: StringIndexed;
}
