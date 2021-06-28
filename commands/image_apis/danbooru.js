const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');

const {
  commands: {
    danbooru: { dan_enabled: enabled, blacklisted_tags: blacklist },
  },
} = require('../../config.json');

function scuffedEncode(str) {
  return str
    .replace(/\s/g, '_')
    .replace('(', '%28')
    .replace(')', '%29')
    .replace('!', '%21')
    .replace(':', '%3A')
    .replace('+', '%2B');
}

module.exports = {
  name: 'dan',
  aliases: ['d', 'danbooru'],
  async execute(client, message, args) {
    // enabled check
    if (!enabled) {
      message.reply('This command is disabled.').then((msg) => {
        setTimeout(() => msg.delete(), 1000);
      });
      return;
    }

    if (!message.channel.nsfw) {
      message.react('❌');
      return;
    }

    let tags = '-status%3Adeleted';
    let badTags = [];

    for (let i = 0, len = args.length; i < len; i++) {
      if (blacklist.indexOf(args[i]) === -1) {
        tags += '+' + scuffedEncode(args[i]);
      } else {
        badTags.push(args[i]);
      }
    }

    const outputMessage = await message.channel.send(`Trying to get image...`);

    const url = `https://danbooru.donmai.us/posts.json?tags=${tags}&random=true&filesize=..8M&limit=1`;
    const response = await fetch(url).then((response) => response.json());

    if (
      response === undefined ||
      response?.length == 0 ||
      response[0]?.file_url === undefined
    ) {
      outputMessage.edit(`Failed to get image.\nTags: ||${tags}||`);
      return;
    }

    const image = response[0].file_url;
    const embed = new MessageEmbed().setImage(image);

    message.channel.send(embed);
    outputMessage.edit(
      `Done! ${badTags.length > 0 ? `*Ignored tags: ${badTags}*` : ''}`
    );
  },
  /*   async execute_help(client, interaction) {
    if (interaction.options.length > 1) {
      if (interaction.options[1].value === 'tags') {
        interaction.reply(
          `Specify tags the same way the site specifies, <https://danbooru.donmai.us/wiki_pages/help%3Acheatsheet>, maximum of 2 and some are blacklisted, so don't even think about it. 🤨\nIf you can't be fucked reading that, basically just put the character name of the person you want and if that doesn't work add a space and an asterisk to the end.`
        );
        return;
      }
    }
    await interaction.reply(`Gets a random post from the Danbooru API.`, {
      ephemeral: true,
    });
  }, */
};
