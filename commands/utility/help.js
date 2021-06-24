const insults_for_dum_dums = [
  "Wow aren't you the most hilarious Discord user ever.",
  'Hahaha me funny brain go unga bunga',
  'Raid my nuts',
];

module.exports = {
  name: 'help',
  aliases: ['h', '?'],
  execute: async (client, message, args) => {
    message.channel.send(
      `Hi ${message.author.username}, I'm currently undergoing a revamp so a lot of my previous commands are not operational.\nIf you'd like to see a list of usable commands you can type \`neko list\``
    );
  },
};
