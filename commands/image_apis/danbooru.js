/* const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');
const blacklisted_tags = [
  'loli',
  'beastiality',
  'shota',
  'rape',
  'incest',
  'child',
  'nacho',
];
const notfound_messages = [
  'No results found, thank fuck.',
  'What you really think I would be able to find something?',
  "I got nothin'",
  '¯\\_(ツ)_/¯ nada',
];
function scuffed_encode(str) {
  str = str
    .replace(/\s/g, '_')
    .replace('(', '%28')
    .replace(')', '%29')
    .replace('!', '%21')
    .replace(':', '%3A')
    .replace('+', '%2B');
  return str;
}

module.exports = {
  name: 'dan',
  aliases: ['d', 'danbooru'],
  async execute(client, message, args) {
    if (!message.channel.nsfw) {
      interaction.reply(`Take it to NSFW you sick freak.`, { ephemeral: true });
      return;
    }
    var tags = '-status%3Adeleted';
    if (interaction.options.length > 0) {
      if (
        blacklisted_tags.includes(interaction.options[0].value.toLowerCase())
      ) {
        interaction.reply(`Seriously? 🤮`, { ephemeral: true });
        return;
      }
      tags += '+' + scuffed_encode(interaction.options[0].value);
      if (interaction.options.length > 1) {
        if (
          blacklisted_tags.includes(interaction.options[1].value.toLowerCase())
        ) {
          interaction.reply(`Seriously? 🤮`, { ephemeral: true });
          return;
        }
        tags += '+' + scuffed_encode(interaction.options[1].value);
      }
    }
    interaction.reply(`Inbound degeneracy...`);
    const url = `https://danbooru.donmai.us/posts.json?tags=${tags}&random=true&filesize=..8M&limit=1`;
    const response = await fetch(url).then((response) => response.json());
    if (response.length == 0 || response[0]?.file_url === undefined) {
      interaction.editReply(
        notfound_messages[Math.floor(Math.random() * notfound_messages.length)]
      );
      return;
    }
    const image = response[0].file_url;
    const embed = new MessageEmbed().setImage(image);
    interaction.channel.send(embed);
    interaction.editReply(`Almost there...`);
    setTimeout(function () {
      interaction.editReply(`Degeneracy Delivered 😎`);
    }, 1000);
  },
  async execute_help(client, interaction) {
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
  },
};
 */
