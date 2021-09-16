import Command, * as Types from '../../../interfaces/Command';
import User from '../../../models/user';

import isAllowed from './isAllowed.module';
const stats: Command = {
    execute: async ({ message }: { message: Types.Message }) => {
        if (!isAllowed(message)) return;

        const [pending, rejected, accepted]: number[] = await Promise.all([
            User.countDocuments({ status: 'pending' }),
            User.countDocuments({ status: 'rejected' }),
            User.countDocuments({ status: 'accepted' }),
        ]);

        const total = pending + rejected + accepted;

        const [pP, rP, aP]: number[] = [pending, rejected, accepted].map((e) => Math.ceil((100 * e) / (total === 0 ? 1 : total)));

        message.channel.send(
            `**${total}** Total Applications:\n${pending} (${pP}%) Pending\n${accepted} (${aP}%) Accepted\n${rejected} (${rP}%) Rejected`
        );
    },
    help: async ({ message }: { message: Types.Message }) => {
        message.channel.send(
            `Returns number of each state of whitelist application.\nUsage: \`neko whitelist stats\`\nAdmin use only.`
        );
    },
};

export default stats;
