export default interface Command {
    help: Function;
    execute: Function;
    disabled?: boolean;
    name?: string;
    aliases?: string[];
}

export interface CommandRouter extends Command {
    name: string;
    aliases?: string[];
    subCommands: Number;
    help: Function;
    execute: Function;
    disabled?: boolean;
}

interface Params {
    client: Client;
    message: Message;
    rcon: Rcon;
    args: string[];
}

import { Client, Message } from 'discord.js';
import { Rcon } from 'rcon-client';

export { Client, Command, Message, Rcon, Params };
