import { Message } from 'discord.js';
import { Command } from '../../../../interfaces/Command';
import { getStats } from '../helpers/databaseTools';
import { WhitelistError } from '../constants/database';

class Stats implements Command {
    public name = 'stats';

    public adminOnly = false;
    public description = 'Shows application statistics.';
    public extendedDescription = 'Shows number and percentage of each application status.';

    public async execute({ message }: { message: Message }) {
        const applicationsFound = await getStats();

        if (applicationsFound instanceof WhitelistError) {
            message.channel.send(applicationsFound.message);
            return;
        }

        const total = applicationsFound.reduce(([s0, n0], [s1, n1]) => [s0, n0 + n1])[1] || 1;

        const output: string[] = [`**${total}** Total Applications:`];
        for (const [status, num] of applicationsFound) {
            output.push(`${num} (${Math.floor((100 * num) / total)}%) ${status[0].toUpperCase() + status.slice(1)}`);
        }
        message.channel.send(output.join('\n'));
    }
}

export const stats = new Stats();
