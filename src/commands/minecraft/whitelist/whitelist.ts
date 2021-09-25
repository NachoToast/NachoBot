import { isAllowed } from './helpers/validation';
import { Command, Params } from '../../../interfaces/Command';

import { modules } from '../../../config.json';
if (!modules.minecraft.rcon.enabled) {
    throw new Error('RCON must be enabled for whitelist submodule to work.');
}

import minecraftServer from '../../../modules/minecraft/rcon';
import loadSubCommands from '../../../helpers/commandModuleHelper';

// subcommand importing
import { apply } from './subcommands/apply';
import { remove } from './subcommands/remove';
import { status } from './subcommands/status';
import { suspend } from './subcommands/suspend';
import { info } from './subcommands/info';
import { list } from './subcommands/list';
import { clear } from './subcommands/clear';
import { accept } from './subcommands/accept';
import { reject } from './subcommands/reject';
import { DENIED_MESSAGES } from './constants/messages';
import { freeze } from './subcommands/freeze';
import { ban } from './subcommands/ban';
import { stats } from './subcommands/stats';
import { listCommands } from './subcommands/listCommands';
import { commandHelpEmbed } from './helpers/embedConstructors';

const [whitelistCommands, whitelistCommandAliases] = loadSubCommands([
    apply,
    remove,
    status,
    suspend,
    info,
    list,
    clear,
    accept,
    reject,
    freeze,
    ban,
    stats,
    listCommands,
    // migrate,
]);

class Whitelist implements Command {
    public name = 'whitelist';
    public aliases = ['w'];
    public commands = whitelistCommands;
    public commandAliases = whitelistCommandAliases;
    public numSubCommands = this.commands.size;

    public async execute(params: Params) {
        if (!minecraftServer.isConnected()) {
            DENIED_MESSAGES.NO_CONNECTION(params.message);
            return;
        }

        if (params.message.channel.type !== 'GUILD_TEXT') {
            // make sure its a GuildTextChannel, otherwise might not be able to access GuildMembers from cache later on
            DENIED_MESSAGES.NOT_GUILD_CHANNEL(params.message);
            return;
        }

        let foundCommand: Command;
        if (!params.args.length) {
            foundCommand = this.commands.get('apply') as Command;
        } else {
            const directlyNamed = this.commands.get(params.args[0].toLowerCase());
            if (!!directlyNamed) {
                foundCommand = directlyNamed;
                params.args.splice(0, 1);
            } else {
                const indirectlyNamed = this.commands.get(this.commandAliases[params.args[0].toLowerCase()]);
                if (!!indirectlyNamed) {
                    foundCommand = indirectlyNamed;
                    params.args.splice(0, 1);
                } else {
                    const searchTerm = params.args[0].toLowerCase();
                    if (searchTerm === 'h' || searchTerm === 'help') {
                        foundCommand = this.commands.get('listcommands') as Command;
                        params.args.splice(0, 1); // not necessary but might as well
                    } else {
                        foundCommand = this.commands.get('apply') as Command;
                    }
                }
            }
        }

        const isAdmin = isAllowed(params.message);
        const fullParams = { ...params, isAdmin };

        foundCommand.execute(fullParams);
    }

    public async help(params: Params) {
        params.args.splice(0, 1);

        let foundCommand: Command | undefined;
        if (!params.args.length) {
            foundCommand = this.commands.get('apply');
        } else {
            foundCommand =
                this.commands.get(params.args[0].toLowerCase()) ??
                this.commands.get(this.commandAliases[params.args[0].toLowerCase()]) ??
                undefined;
        }

        if (!foundCommand) {
            DENIED_MESSAGES.SUBCOMMAND_NONEXISTANT(params.message, params.args[0]);
            return;
        }

        params.message.channel.send({ embeds: [commandHelpEmbed(foundCommand)] });
    }
}

export const whitelist = new Whitelist();
