import { isAllowed } from '../../../modules/minecraft/whitelist/validation';
import { Command, CommandWithHelp, Params } from '../../../interfaces/Command';

import { modules } from '../../../config.json';
if (!modules.minecraft.rcon.enabled) {
    throw new Error('RCON must be enabled for whitelist submodule to work.');
}

import minecraftServer from '../../../modules/minecraft/rcon.module';

import loadSubCommands from '../../../helpers/commandModuleHelper';
import filterMessage from '../../../modules/mentionFilter.module';

// subcommand importing
import { help } from './subcommands/help';
import { apply } from './subcommands/apply';
import { remove } from './subcommands/remove';
import { status } from './subcommands/status';
import { suspend } from './subcommands/suspend';
import { info } from './subcommands/info';
import { list } from './subcommands/list';
import { clear } from './subcommands/clear';
import { accept } from './subcommands/accept';
import { reject } from './subcommands/reject';

const [whitelistCommands, whitelistCommandAliases] = loadSubCommands([
    apply,
    help,
    remove,
    status,
    suspend,
    info,
    list,
    clear,
    accept,
    reject,
]);

class Whitelist implements Command {
    public name = 'whitelist';
    public aliases = ['w'];
    public commands = whitelistCommands;
    public commandAliases = whitelistCommandAliases;
    public numSubCommands = this.commands.size;
    public async execute(params: Params, helpMode = false) {
        if (!minecraftServer.isConnected() && !helpMode) {
            params.message.channel.send(`Could not connect to Minecraft server, please try again later.`);
            return;
        }

        const foundCommand = !!params.args.length
            ? this.commands.get(params.args[0].toLowerCase()) ??
              this.commands.get(this.commandAliases[params.args[0].toLowerCase()])
            : undefined;

        const isAdmin = isAllowed(params.message);

        const fullParams = { ...params, isAdmin };
        if (!foundCommand) {
            if (!!params.args.length && helpMode) {
                // e.g. neko help whitelist a_nonexistant_arg
                params.message.channel.send(`Subcommand '${filterMessage(params.args[0])}' does not exist.`);
            } else if (helpMode) {
                // e.g. neko help whitelist
                (this.commands.get('help') as CommandWithHelp).help(fullParams);
            } else {
                // e.g. neko whitelist
                this.commands.get('APPLY')?.execute(fullParams);
            }
            return;
        }

        if (!helpMode) foundCommand.execute(fullParams);
        else {
            if (!!foundCommand?.help) foundCommand.help(fullParams);
            else params.message.channel.send(`No help found for '${foundCommand.name}' subcommand.`);
        }
    }
    public async help(params: Params) {
        params.args.splice(0, 1);
        this.execute(params, true);
    }
}

export const whitelist = new Whitelist();
