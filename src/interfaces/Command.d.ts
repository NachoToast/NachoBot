import { Client, Message } from 'discord.js';
import { Rcon } from 'rcon-client';

export default interface Command {
    name: string;
    aliases?: string[];
    execute: Function;
    help?: Function;
    disabled?: boolean;
    numSubCommands?: number | undefined;
}

export interface CommandAliasesMap {
    [index: string]: string;
}

export interface Params {
    client: Client;
    message: Message;
    args: string[];
}
