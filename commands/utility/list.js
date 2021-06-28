const { bestPrefix: prefix } = require('../../config.json');

const workingCommands = [
  {
    name: 'help',
    desc: 'Get help for the bot or a specific command.',
  },
  {
    name: 'ping',
    desc: 'Pings the bot.',
  },
  {
    name: 'whitelist',
    desc: 'Generate whitelist application link for Minecraft server.',
  },
  {
    name: 'cat',
    desc: 'Give a random cat image.',
  },
  {
    name: 'dan',
    desc: 'Get image from Danbooru API.',
  },
  {
    name: 'san',
    desc: 'Get image from Safebooru API.',
  },
];

module.exports = {
  name: 'list',
  aliases: ['l', 'commands'],
  execute: async (client, message, args) => {
    let response = `Commands List:`;
    workingCommands.forEach((e) => {
      response += '\n`' + prefix + ' ' + e.name + '` - ' + e.desc;
    });
    message.channel.send(response);
  },
};
