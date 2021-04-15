const Discord= require("discord.js");
const Danbooru = require('danbooru');

module.exports= {
    name: 'danbooru/authenticate',
    description: 'danbooru and safebooru stuff',
    execute: async (client, message, command, args, debugmode) => {
            if ((args[0] === 'bonk') || (args[0] === 'b')) {
                client.commands.get('horny').execute(message);
            }
            else if ((command === 'dan') || (command ==='d')) {
                if (message.channel.nsfw) {
                    // Perform a search for popular image posts
                    const booru = new Danbooru()
                    var tags = '-status:deleted';
                    const blacklisted_tags = [
                        'loli',
                        'bestiality',
                        'shota',
                        'rape',
                        'incest',
                        'child'
                    ];
                    if ((blacklisted_tags.includes(args[0])) || blacklisted_tags.includes(args[1])) {
                        console.log(`${message.author} used blacklisted tag, ${args[0]}, ${args[1]}`);
                        message.react('❌');
                        message.channel.send('https://cdn.myanimelist.net/images/characters/16/123253.jpg');
                        return;
                    }
                    if (args[0]) {
                        if (args[1]) tags = `${args[0]} ${args[1]} -status:deleted`
                        else tags = `${args[0]} -status:deleted`
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
                    if (debugmode >= 1) {
                        if (args[0]) {
                            if (args[1]) message.channel.send(`${args[0]} ${args[1]}`)
                            else message.channel.send(args[0])
                        }
                        else message.channel.send('No Tags')
                    }
                    }).catch(e => {message.channel.send('No Results Found. <:Sadge:759596188658958396>')});
                }
                else message.react('794405448266154005')
            }
            else if (command === 'sans') {
                const sanses = [
                    'https://static.wikia.nocookie.net/the-au-book-guide-undertale/images/0/0c/Sans_The_Skeleton.jpg/revision/latest?cb=20200223213504',
                    'https://i.pinimg.com/originals/c7/3c/00/c73c00959784b105bea2a7a9a2666fdd.png',
                    'https://fiverr-res.cloudinary.com/images/q_auto,f_auto/gigs/120791781/original/4cb47ad6a2b5930c07c07b3b26839f366dd5529b/say-anything-you-want-in-a-poor-sans-undertale-cosplay.jpg',
                    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSu9_C1_Dparvb1xLjj2_e3H-mJx6rhPLij3Q&usqp=CAU',
                    'https://c4.wallpaperflare.com/wallpaper/468/993/284/video-game-undertale-sans-undertale-wallpaper-preview.jpg',
                    'https://i.pinimg.com/originals/37/86/51/378651425f72a7976aaa3f0f4249fa5d.jpg'
                ];
                const index = Math.floor(Math.random() * sanses.length);
                const final_sans = sanses[index];
                const sans_imageEmbed = new Discord.MessageEmbed()
                .setImage(final_sans);
                message.channel.send(sans_imageEmbed);
                //message.channel.send('sans');
        }
            else if ((command === 'san') || (command ==='s')) {
                    // Perform a search for popular image posts
                    const booru = new Danbooru('https://safebooru.donmai.us/');

                    var tags = '-status:deleted';
                    if (args[0]) {
                        if (args[1]) tags = `${args[0]} ${args[1]} -status:deleted`
                        else tags = `${args[0]} -status:deleted`
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
                    if (debugmode >= 1) {
                        if (args[0]) {
                            if (args[1]) message.channel.send(`${args[0]} ${args[1]}`)
                            else message.channel.send(args[0])
                        }
                        else message.channel.send('No Tags')
                    }
                    }).catch(e => {message.channel.send('No Results Found. <:Sadge:759596188658958396>')});
            }
    }
}