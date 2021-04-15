//const Discord= require("discord.js");

module.exports= {
    name: 'osu/profile',
    description: 'get osu profile data',
    execute: async (message, args, osu_token, fetch) => {
        var osu_profile_id = args[1];
        const response = await fetch(`https://osu.ppy.sh/api/v2/users/${osu_profile_id}/osu`, {
            method: 'get',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              Authorization: `Bearer ${osu_token}`
            }
        })
        const data = await response.json();
        //userprofile = data.username;
        //message.channel.send(userprofile).catch(e => message.channel.send('user not found'));
        //message.channel.send(osu_token);
        const Discord= require("discord.js");
        //
        // Create Embed
        try {
        const osu_profileEmbed = new Discord.MessageEmbed()
        .setColor('#FF66AA')
        .setTitle(data.username)
        .setURL(`https://osu.ppy.sh/users/${osu_profile_id}`)
        .setThumbnail(data.avatar_url)
        .setDescription(`#${data.statistics.rank.global} Global (#${data.statistics.rank.country} Country)\n${data.statistics.pp}pp || ${data.statistics.hit_accuracy}% Accuracy`)
        .setFooter('Joined ' + data.join_date)
        message.channel.send(osu_profileEmbed)
        }
        catch(err) {
            message.channel.send('User Not Found. <:Sadge:759596188658958396>')
        }
        
    }
}