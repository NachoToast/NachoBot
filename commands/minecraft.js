const fs = require('fs');
const config = require('../config.json');
const util = require("minecraft-server-util");

module.exports= {
    name: 'minecraft',
    description: 'bot gives minecraft server updates.',
    execute: async (client, coolguy) => {
        server = {
            online: false,
            host: "nachotoast.com",
            version: "Paper 1.16.5",
            onlinePlayers: 0,
            maxPlayers: 50
        }
        await util.status("nachotoast.com").then((result) => {
            server.online = true;
            server.host = result.host;
            server.version = result.version;
            server.onlinePlayers = result.onlinePlayers;
            server.maxPlayers = result.maxPlayers;
        }).catch(err => server.online = false);
        var d = new Date();
        var t_hours = d.getHours();
        var t_minutes = d.getMinutes();
        var t_seconds = d.getSeconds();
        var t_suffix = 'am'
        if (t_hours >= 12) {
            t_suffix = 'pm';
            if (t_hours > 12) t_hours -= 12;
        }
        if (t_minutes <= 9) {
            t_minutes = `0${t_minutes}`
        }
        if (t_seconds <= 9 ) t_seconds = `0${t_seconds}`;
        var statusMsg;
        if (server.online == true) {
            statusMsg = `Server Status: **Online** ✅\nIP: **${server.host}**\n${server.version}\n${server.onlinePlayers}/${server.maxPlayers} Players Online\n\n*Last Checked:  ${t_hours}:${t_minutes}:${t_seconds} ${t_suffix}\nChecking Every ${config.server_interval} seconds*`;
        }
        else {
            statusMsg = `Server Status: **Offline** ❌\n*Last Checked: ${t_hours}:${t_minutes}:${t_seconds} ${t_suffix}\nChecking Every ${config.server_interval} seconds*`;
        }
        fs.readFile("data/serverstatus.json", "utf-8", (err, data) => {
            if (err) throw err;
            var oldStatus = JSON.parse(data.toString());
            if (oldStatus.online !== server.online) { // If change in online state.
                // Update stored online state (to avoid loops).
                oldStatus.online = server.online;
                newStatus = JSON.stringify(oldStatus, null, 4);
                fs.writeFile("data/serverstatus.json", newStatus, (err) => { if (err) throw err; });
                
                // Send alert.
                if (server.online == true) coolguy.send("Server Back.");
                else coolguy.send("Server Down.");
            }
            async function edit(client) {
                for (let i = 0; i < config.minecraftUpdate.channels.length; i++) {
                    let channel = await client.channels.fetch(config.minecraftUpdate.channels[i]);
                    let message = await channel.messages.fetch(config.minecraftUpdate.messages[i]);
                    message.edit(statusMsg)
                }
            }
            edit(client);
        })
    }
}
//      const channel = await client.channels.fetch('795106209946402841');
//      const message = await channel.messages.fetch('816064319489572914');