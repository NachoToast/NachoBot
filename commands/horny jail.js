const Discord= require("discord.js");
module.exports= {
    name: 'horny',
    description: 'bot sends you to horny jail',
    execute(message){
        hornyEmbed = new Discord.MessageEmbed()
        //.setDescription('Go to horny jail.')
        .setImage('https://media1.tenor.com/images/6493bee2be7ae168a5ef7a68cf751868/tenor.gif');
        message.channel.send(hornyEmbed);
    }
}