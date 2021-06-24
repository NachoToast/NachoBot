const {
  reactRoles: { nodes },
} = require('../config.json');

module.exports = async (client) => {
  const allNodes = Object.keys(nodes);
  const destroyedNodes = [];

  for (let i = 0, len = allNodes.length; i < len; i++) {
    const channel = allNodes[i];
    for (let i = 0, len = Object.keys(nodes[channel]).length; i < len; i++) {}
  }
};
