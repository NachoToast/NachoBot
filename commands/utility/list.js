const workingCommands = [
  {
    name: 'help',
    desc: 'Get help for the bot or a specific command.',
  },
  {
    name: 'whitelist',
    desc: 'Generate whitelist application link for Minecraft server.',
  },
  {
    name: 'cat',
    desc: 'Give a random cat image.',
  },
];

const { bestPrefix: prefix } = require('../../config.json');

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
