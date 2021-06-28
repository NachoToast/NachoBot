const pingResponses = [
  'Pongers!',
  'Pingchomp!',
  'Pagman',
  'Hello Bitch',
  'Exiting the Obamasphere',
  'Lefa',
];

module.exports = {
  name: 'ping',
  aliases: ['p'],
  execute: async (client, message, args) => {
    let response =
      pingResponses[Math.floor(Math.random() * pingResponses.length)];

    if (args.indexOf('l') !== -1) {
      response +=
        '\nLatency:' +
        Math.abs(Date.now() - message.createdTimestamp) +
        ' ms - API: ' +
        Math.round(Math.round(client.ws.ping)) +
        ' ms';
    }

    if (args.indexOf('m') !== -1) {
      response += '\nMinecraft ping coming soon™';
    }

    message.channel.send(response);
  },
};
