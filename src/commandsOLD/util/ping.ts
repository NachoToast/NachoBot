import Command, * as Types from '../../interfaces/Command';

const ping: Command = {
    name: 'ping',
    aliases: ['p'],
    execute: async ({
        client,
        rcon,
        message,
        args = [],
    }: {
        client: Types.Client;
        rcon: Types.Rcon;
        message: Types.Message;
        args: string[];
    }) => {
        if (args.includes('mc')) {
            const [tps, playerInfo]: any = await Promise.all([rcon.send('tps'), rcon.send('list')]).catch((error) => {
                console.log(error);
                message.channel.send(`Error occured, server probably down.`);
                return;
            });

            message.channel.send(`${tps.replace(/§6|§a/g, '')}\n${playerInfo}`);
            /* 
              '§6TPS from last 1m, 5m, 15m: §a20.0, §a20.0, §a20.0\n',
                'There are 1 of a max of 50 players online: NachoToast'
            */
        } else {
            let response = `Pongers! (${Math.abs(Date.now() - message.createdTimestamp)}ms)`;
            if (args.includes('v')) {
                response += `\nAPI Latency: ${Math.round(client.ws.ping)}ms`;
            }
            message.channel.send(response);
        }
    },
    help: async ({ message }: { message: Types.Message }) => {
        message.channel.send(
            `Pings the bot or related things.\nUsage: \`neko ping <flags>\`\n\nFlags: \`mc\` - Pings the Minecraft server.\n\`v\` - Gets Discord API latency.`
        );
    },
};

module.exports = ping;
