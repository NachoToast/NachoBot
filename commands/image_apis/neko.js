const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');

const {
  commands: {
    danbooru: { dan_enabled: enabled },
  },
} = require('../../config.json');

module.exports = {
  name: 'neko',
  aliases: [],
  async execute(client, message, args) {
    // enabled check
    if (!enabled) {
      message.reply('This command is disabled.').then((msg) => {
        setTimeout(() => msg.delete(), 1000);
      });
      return;
    }

    if (args[0] === 'ni') {
      message.channel.send(
        `https://media1.tenor.com/images/2a9724114ec3badca73a9128331b0f05/tenor.gif`
      );
      return;
    }

    if (!message.channel.nsfw) {
      message.react('❌');
      return;
    }

    const outputMessage = await message.channel.send(`Trying to get image...`);

    const url = `https://danbooru.donmai.us/posts.json?tags=nekomimi&random=true&filesize=..8M&limit=1`;
    const response = await fetch(url).then((response) => response.json());

    if (
      response === undefined ||
      response?.length == 0 ||
      response[0]?.file_url === undefined
    ) {
      outputMessage.edit(`Failed to get image.`);
      return;
    }

    const image = response[0].file_url;
    const embed = new MessageEmbed().setImage(image);

    message.channel.send(embed);
    outputMessage.edit('Done!');
  },
};
