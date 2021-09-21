import { Message } from 'discord.js';
import { Command } from '../../../../interfaces/Command';
import { getSingleDBUser, removeEntry } from '../../../../modules/minecraft/whitelist/databaseTools';
import { WhitelistValidator } from '../../../../modules/minecraft/whitelist/validation';

class Remove implements Command {
    public name = 'remove';
    public aliases = ['r'];

    public async execute({ message, args, isAdmin }: { message: Message; args: string[]; isAdmin: boolean }) {
        args.splice(0, 1); // remove 'r' from args

        if (!WhitelistValidator.applicationsOpen) {
            message.channel.send(`Whitelist applications are currently suspended, this also includes removals.`);
            return;
        }

        if (!!args.length && isAdmin) {
            message.channel.send(
                `Alias 'r' is reserved for the \`remove\` command, for rejections please use \`reject\`, for proxied removals use \`clear\`.`
            );
            return;
        }

        const discordId = message.author.id;

        const existingDbUser = await getSingleDBUser(discordId);
        if (existingDbUser === undefined) {
            message.channel.send(`Error occured querying database, please contact <@240312568273436674>`);
            return;
        } else if (existingDbUser === null) {
            message.channel.send(`You don't have an application to remove.`);
            return;
        } else if (existingDbUser.status !== 'pending') {
            message.channel.send(`Only pending applications can be removed.`);
            return;
        }

        const deletedUser = await removeEntry(discordId, 'pending');
        if (deletedUser === undefined) {
            message.channel.send(`Error occured removing from database, please contact <@240312568273436674>`);
        } else if (!deletedUser) {
            message.channel.send(
                `Unable to find user to remove from database, this is an error, please contact <@240312568273436674>`
            );
        } else {
            message.channel.send(`Successfully removed your application (linked to '${deletedUser.minecraft}')`);
        }
    }

    public async help({ message }: { message: Message }) {
        message.channel.send(`Removes your whitelist application, only works if it's pending.\nUsage: \`neko whitelist remove\``);
    }
}

export const remove = new Remove();
