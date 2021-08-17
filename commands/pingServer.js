module.exports = {
    name: 'pingServer',
    // pings the minecraft server
    execute: async (message, rcon) => {
        const res = await Promise.all([rcon.send('tps'), rcon.send('list')]).catch((error) => {
            console.log(error);
            message.channel.send(`Error occured, server probaly down.`);
            return;
        });

        const tps = res[0].replace(/§6|§a/g, '');

        const playerInfo = res[1].split(' ');
        const currentPlayers = Number(playerInfo[2]);
        const maxPlayers = Number(playerInfo[7]);
        const playerArray = playerInfo.slice(10);
        console.log(playerArray);

        message.channel.send(`${tps}\n${currentPlayers}/${maxPlayers} Players Online`);
    },
};
