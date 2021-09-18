import isAllowed from '../../../commandsOLD/minecraft/whitelist/isAllowed.module';
import Command, { CommandClass, Params } from '../../../interfaces/Command';

import { basicHelp, adminHelp } from './subcommands/help';
import { modules } from '../../../config.json';

if (!modules.minecraft.rcon.enabled) {
    throw new Error('RCON must be enabled for whitelist submodule to work.');
}

import minecraftServer from '../../../modules/minecraft/rcon.module';
minecraftServer.isConnected(); // for some reason nothing works from that file unless I call something in it

class Whitelist implements CommandClass {
    public aliases = ['w'];
    public numSubCommands = 1;
    public async execute(params: Params, helpMode = false) {
        let subCommandToExecute: Command | CommandClass;
        // if coming from help command, search command to use by args[1] (since args[0] is "help")
        const searchParam = helpMode ? params.args[1] ?? params.args[0] : params.args[0];
        switch (searchParam) {
            case 'h':
            case 'help':
                subCommandToExecute =
                    (isAllowed(params.message) && !params.args.includes('basic')) || params.args.includes('admin')
                        ? adminHelp
                        : basicHelp;
                break;
            default:
                subCommandToExecute = basicHelp;
                break;
        }

        if (helpMode) {
            if (!!subCommandToExecute.help) subCommandToExecute.help(params);
            else params.message.channel.send(`${subCommandToExecute?.name || 'that'} subcommand has no help section.`);
        } else subCommandToExecute.execute(params);
    }
    public async help(params: Params) {
        this.execute(params, true);
    }
}

export default new Whitelist();
