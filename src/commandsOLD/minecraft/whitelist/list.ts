import Command, * as Types from '../../../interfaces/Command';
import { MessageEmbed } from 'discord.js';
import User from '../../../models/user';
import moment from 'moment';

import Application from '../../../interfaces/Application';
import isAllowed from './isAllowed.module';

const list: Command = {
    execute: async ({ message }: { message: Types.Message }) => {
        if (!isAllowed(message)) return;

        const applications: Application[] = await User.find({ status: 'pending' }).limit(10);

        if (applications.length < 1) {
            message.channel.send(`No pending whitelist applications.`);
            return;
        }

        let embedDescription: string[] = [];
        for (let i = 0, len = applications.length; i < len; i++) {
            embedDescription.push(
                `${i + 1}. ${applications[i]?.minecraft} - <@${applications[i]?.discord}> (${moment(
                    applications[i]?.applied
                ).fromNow()})`
            );
        }

        const output = new MessageEmbed()
            .setTitle(`Oldest ${applications.length} Pending Whitelist Applications`)
            .setDescription(embedDescription.join('\n'));

        message.channel.send({ embeds: [output] });
    },
    help: async ({ message }: { message: Types.Message }) => {
        message.channel.send(`List oldest 10 pending whitelist applications.\nUsage: \`neko whitelist list \`\nAdmin use only.`);
    },
};

export default list;
