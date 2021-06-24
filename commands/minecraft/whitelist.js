const {
  commands: {
    nachotoastMC: { enabled, sendDiscordID: get, endpoint },
  },
} = require('../../config.json');

const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'whitelist',
  aliases: ['w'],
  execute: async (client, message, args) => {
    // enabled check
    if (!enabled) {
      message.react('❌');
      message.reply('This command is disabled.').then((msg) => {
        setTimeout(() => msg.delete(), 1000);
      });
      return;
    }

    const embed = new MessageEmbed()
      .setURL(endpoint + (get ? `?d=${message.author.id}` : ''))
      .setTitle('Whitelist Application')
      .setThumbnail('https://ntgc.ddns.net/s/c/cool/7.png')
      .setDescription(
        `Hi ${message.author.username}.\nClick here to apply for the whitelist.`
      )
      .setColor('#ca993d');

    message.author.send(embed);
    message.react('✅');
  },
};
