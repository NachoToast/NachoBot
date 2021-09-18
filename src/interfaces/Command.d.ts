import { Client, Message } from 'discord.js';
import { Rcon } from 'rcon-client';

export interface CommandClass {
    name?: string;
    aliases?: string[];
    execute: Function;
    help?: Function;
    disabled?: boolean;
    numSubCommands?: number | undefined;
    [any: string]: any;
}

export default interface Command extends CommandClass {
    name: string;
}

export interface CommandAliasesMap {
    [index: string]: string;
}

export interface Params {
    client: Client;
    message: Message;
    args: string[];
}
