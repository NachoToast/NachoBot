const ping_responses = [
  'Pongers!',
  'Pingchomp!',
  'Pagman',
  'Hello Bitch',
  'Exiting the Obamasphere',
  'Lefa',
];

module.exports = {
  name: 'ping',
  execute: async (client, message, args) => {
    extras = '';
    if (
      interaction.options.length > 0 &&
      interaction.options[0].name === 'flags'
    ) {
      switch (interaction.options[0].value) {
        case 'l':
          extras += `\nLatency: ${Math.abs(
            Date.now() - interaction.createdTimestamp
          )}ms - API Latency: ${Math.round(client.ws.ping)}ms`;
          break;
        case 'mc':
          extras += `\nMinecraft ping coming soon™`;
        default:
          break;
      }
    }
    interaction.reply(
      `${
        ping_responses[Math.floor(Math.random() * ping_responses.length)]
      } ${extras}`
    );
  },
};
