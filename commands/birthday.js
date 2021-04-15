const Discord= require("discord.js");
module.exports= {
    name: 'birthday',
    description: 'bot wishes u a happy birthday :D',
    execute(message){
        const reactpool = ['🥳', '💜', '764740680525676544', '604895069161521175'];
        const reaction = Math.floor(Math.random() * reactpool.length);
        message.react(reactpool[reaction]);
    }
}