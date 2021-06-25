const {
  commands: {
    nachotoastMC: {
      enabled,
      whitelistCheckEndpoint: endpoint,
      whitelistCheckSecret: secret,
      whitelistCheckInterval: interval,
      whitelistChannel: channel,
    },
  },
} = require('../config.json');
const fetch = require('node-fetch');

module.exports = async (client) => {
  // enabled check
  if (!enabled) {
    return;
  }

  // request construction
  const response = await fetch(endpoint, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      secret: secret,
      minTimestamp: 60 * Math.ceil(interval),
      // minTimestamp: 2,
    }),
  });

  const data = await response.json();

  if (data.length < 1) {
    return;
  }

  for (let i = 0, len = data.length; i < len; i++) {
    client.channels.cache
      .get(channel)
      .send(
        `${data[i][1]} (<@${data[i][0]}>) has been added to the whitelist.`
      );
  }

  // convert to promises
  for (let i = 0, len = data.length; i < len; i++) {
    data[i] = new Promise((resolve) =>
      resolve(createMessage(client, data[i][0], data[i][1]))
    );
  }

  // do promises in parallel
  await Promise.all(data);
};

function createMessage(client, discord, minecraft) {
  return new Promise(async (resolve) => {
    const user = await client?.users.fetch(discord).catch((e) => null);
    if (user) {
      user.send(
        `Hi ${minecraft}, your whitelist application for the UoA Minecraft server has just been **approved**! 👍`
      );
    }
    resolve();
    return;
  });
}
