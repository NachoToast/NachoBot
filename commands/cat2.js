const Discord= require("discord.js");
const fetch = require('node-fetch');
module.exports= {
    name: 'cat2',
    description: 'bot give cute cat photo :D',
    execute: async (message) => {
        const { file } = await fetch('https://aws.random.cat/meow').then(response => response.json());
        message.channel.send(file);
    }
}