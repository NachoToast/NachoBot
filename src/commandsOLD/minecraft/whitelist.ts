import Command, { CommandRouter, Params } from '../../interfaces/Command';

import isAllowed from './whitelist/isAllowed.module';

import apply from './whitelist/apply';
import list from './whitelist/list';
import adminHelp from './whitelist/adminHelp';
import accept from './whitelist/accept';
import reject from './whitelist/reject';
import query from './whitelist/query';
import remove from './whitelist/remove';
import clear from './whitelist/clear';
import basicHelp from './whitelist/basicHelp';
import stats from './whitelist/stats';

const whitelist: CommandRouter = {
    name: 'whitelist',
    aliases: ['w'],
    subCommands: 10,
    execute: async (params: Params, helpMode = false) => {
        if (whitelist?.disabled) return;
        let subCommandToExecute: Command;

        switch (helpMode ? params.args[1] ?? params.args[0] : params.args[0]) {
            case 'list': // neko whitelist list
            case 'l':
                subCommandToExecute = list;
                break;
            case 'h':
            case 'help':
                if (isAllowed(params.message)) subCommandToExecute = adminHelp;
                else subCommandToExecute = basicHelp;
                break;
            case 'accept':
            case 'a':
                subCommandToExecute = accept;
                break;
            case 'remove':
                subCommandToExecute = remove;
                break;
            case 'reject':
                subCommandToExecute = reject;
                break;
            case 'r':
                if (isAllowed(params.message)) subCommandToExecute = reject;
                else subCommandToExecute = remove;
                break;
            case 'query':
            case 'q':
                subCommandToExecute = query;
                break;
            case 'clear':
            case 'c':
                subCommandToExecute = clear;
                break;
            case 'stats':
            case 's':
                subCommandToExecute = stats;
                break;
            default:
                subCommandToExecute = apply;
                break;
        }

        if (helpMode) {
            subCommandToExecute.help(params);
        } else {
            subCommandToExecute.execute(params);
        }
    },
    help: async (params: Params) => {
        whitelist.execute(params, true);
    },
};

module.exports = whitelist;
