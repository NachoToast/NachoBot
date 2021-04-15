const Discord= require("discord.js");
const Danbooru = require('danbooru');

module.exports= {
    name: 'danbooru/nekopara',
    description: 'nekopara specific danbooru stuff',
    execute: async (args, message) => {
                if (message.channel.nsfw) {
                    // Perform a search for popular image posts
                    const booru = new Danbooru()
                    var tags = '-status:deleted *_(nekopara)';
                    const blacklisted_tags = [
                        'loli',
                        'bestiality',
                        'shota',
                        'rape',
                        'incest',
                        'child'
                    ];
                    if (blacklisted_tags.includes(args[0])) {
                        console.log(`${message.author} used blacklisted tag, ${args[0]}`);
                        message.react('❌');
                        message.channel.send('https://cdn.myanimelist.net/images/characters/16/123253.jpg');
                        return;
                    }
                    if (args[0]) {
                        tags = `${args[0]} -status:deleted *_(nekopara)`
                    }
                    booru.posts({ tags: `${tags}` }).then(posts => {
                    // Select a random post from posts array
                    const index = Math.floor(Math.random() * posts.length)
                    const post = posts[index]
                    
                    const url = booru.url(post.file_url);
                    //message.channel.send(`${url}`);
                    const booru_imageEmbed = new Discord.MessageEmbed()
                    .setImage(url);
                    message.channel.send(booru_imageEmbed);
                    //message.channel.send('`' + tags + '`');
                    }).catch(e => {message.channel.send('No Results Found. <:Sadge:759596188658958396>')});
                }
                else message.react('794405448266154005')
    }
}