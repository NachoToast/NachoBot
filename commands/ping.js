module.exports= {
    name: 'ping',
    description: 'ping the bot',
    execute: async (client, message, args) => {
        if (args[0] === 'l') message.channel.send(`Latency: ${Math.abs(Date.now() - message.createdTimestamp)}ms\nAPI Latency: ${Math.round(client.ws.ping)}ms`);
        else if (args[0] === 'm') {
            const fetch = require('node-fetch');
            const response = await fetch("https://mcapi.cf/api/server/ntgc.ddns.net");
            const data = await response.json();
            if (data.motd.length >= 2) {
                message.channel.send(`Minecraft server is **up**. ✅\n*Checked in ${Math.abs(Date.now()-message.createdTimestamp)}ms*`);
            }
            else message.channel.send(`Minecraft server is **down**. ❌\n*Checked in ${Math.abs(Date.now()-message.createdTimestamp)}ms*`);
        }
        else if (args[0] === 'ntgc') {
            message.channel.send('coming soon');
        }
        else message.channel.send('pongers!');
    }
}