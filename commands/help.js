const Discord = require('discord.js');
module.exports= {
    name: 'help',
    description: 'get osu authentication bearer token',
    execute: async (message, args, prefixes) => {
        if (
                (args[0] === 'san' || args[0] === 's' || args[0] === 'dan' || args[0] === 'd')
                &&
                (args[1] === 'tags' | args[1] === 't')
        ) {
            const helpEmbed = new Discord.MessageEmbed()
            .setColor('#00FFFF')
            .setTitle('Dan/San Help (Tags)')
            .setThumbnail('https://i.imgur.com/hqS3ivS.jpeg')
            .addFields(
                { name: 'Tag Info', value: ' Replace underscores (\\_) with spaces for tags with multiple words, like full names and series titles.\nIgnore Discord trying to format your message weirdly when you include underscores and other characters, and don\'t escape (\)them.\nSearching with multiple tags (seperated by spaces) will look for posts that fit both of them.\nYou can search with up to 2 tags, but they are entirely optional.'},
                { name: 'Tag Prefixes', value: 'A dash (-) means exclude that tag\nA tilda (\\~) turns the tag into an \'OR\' filter.\nAn asterix (\\*) is a wildcard, meaning it could be anything. Wildcards cannot be included with \'OR\' tags.'},
                { name: 'Tag Examples', value: 'blue\\_eyes blonde\\_hair | searches characters with blue eyes and blonde hair.\nblue\\_eyes -blonde\\_hair | searches for characters with blue eyes but not blonde hair.\n\\~blue\\_eyes \\~blonde\\_hair | searches for characters with blue eyes or blonde hair, but not both.\n-blue\\_eyes -blonde\\_hair | searches for characters without blue eyes blonde hair.'},
                { name: 'Notable Tags', value: 'age:<1month | searches for posts made <1 month ago, NOT the other age >:(.\nfavcount:>40 | searches for posts above a certain number of favourites, works as a good general quality filter.\nscore:>100 | same as above. age:<3years | searches only for posts made in given timeframe.\nrating:s | filters by rating, from s/q/e (safe/questionable/explicit), although this is \\*really\\* ambiguous on Danbooru.'},
                { name: 'Misc Info', value: 'Sometimes characters names by themselves aren\'t enough, for instance just `zero_two` will not return anything, but zero\\_two\\_(darling\\_in\\_the\\_franxx) will.\nQuestionable and possibly TOS-violating tags are automatically blacklisted.'}
                )
            message.channel.send(helpEmbed);
        }
        else if ((args[0] === 'san') || (args[0] === 's')) {
            const helpEmbed = new Discord.MessageEmbed()
            .setColor('#00FFFF')
            .setTitle('San Help')
            .setThumbnail('https://i.imgur.com/hqS3ivS.jpeg')
            .setDescription('\'Neko San\' returns an image from the online anime image database safebooru. You can add tags to your message to filter what types of images you get back. For information on how to properly use and syntax tags, use `neko help san tags` (alternatively `neko h s t`)')
            .addFields(
                { name : 'Example Usage', value: 'neko dan hatsune_miku favcount:>20\nnachiii san fate/grand_order age:<1month\nnachobot dan tamamo_* rating:s\nnacho san catboy -blonde_hair'}
                )
            message.channel.send(helpEmbed);
        }
        else if ((args[0] === 'dan') || (args[0] === 'd')) {
            const helpEmbed = new Discord.MessageEmbed()
            .setColor('#00FFFF')
            .setTitle('Dan Help')
            .setThumbnail('https://i.imgur.com/hqS3ivS.jpeg')
            .setDescription('\'Neko Dan\' returns an image from the online anime image database danbooru. You can add tags to your message to filter what types of images you get back. For information on how to properly use and syntax tags, use `neko help san tags` (alternatively `neko h s t`)\nDanbooru is a NSFW image database, so you can only use this command in NSFW channels.')
            .addFields(
                { name : 'Example Usage', value: 'neko dan hatsune_miku favcount:>20\nnachiii san fate/grand_order age:<1month\nnachobot dan tamamo_* rating:s\nnacho san catboy -blonde_hair'}
                )
            message.channel.send(helpEmbed);
        }
        else if ((args[0] === 'ping') || (args[0] === 'p')) {
            const helpEmbed = new Discord.MessageEmbed()
            .setColor('#00FFFF')
            .setTitle('Ping Help')
            .setThumbnail('https://i.imgur.com/hqS3ivS.jpeg')
            .setDescription('Pings NachoBot.')
            .addFields(
                { name : 'Arguments', value: 'Adding `l` (lowercase L) shows latency.\nAdding `m` pings the minecraft server (ntgc.ddns.net).'},
                { name: 'Example Usage', value : 'neko ping l\nneko ping w https://google.com'}
                )
            message.channel.send(helpEmbed);
        }
        else {
                const helpEmbed = new Discord.MessageEmbed()
                .setColor('#FF00FF')
                .setTitle('NachoBot Help')
                .setThumbnail('https://i.imgur.com/hqS3ivS.jpeg')
                .setDescription('To see command-specific help, such as subcommands and argument details, use `NachoBot help <command name>`.\nExample: `NachoBot help ping`\nTo use Commands: <prefix> <command> <arguments>. Example: `neko ping l`\nPrefixes, commands, and arguments aren\'t case sensitive, and any prefix can be used.\nCommands have aliases which are shown in the lists below.\nExample: `neko c` as opposed to `neko cat`')
                .addFields(
                    { name : 'Prefixes', value: `${prefixes}`},
                    { name: 'Game Related Commands', value: 'osu! (o)\nOverwatch (ow)\nMinecraft (mc)', inline: true},
                    { name: 'Media Related Commands', value: 'Dan (d)\nSan(s)\nSans\nCat (c)', inline: true},
                    { name: 'Miscellaneous Commands', value: 'NTGC\nPing (p)\nHorny (Bonk)\nInfo (i)', inline: true},/*
                    { name: 'MC', value: 'Minecraft related commands, coming soon!'},
                    { name: 'Dan/San', value: 'Returns images from Danbooru (NSFW) and Safebooru (SFW)\nUse `NachoBot help dan` or `NachoBot help san` for command specific info.'},
                    { name: 'Ping', value: 'Various ping related commands, use `NachoBot help ping` for ping subcommands.'},
                    { name: 'Other', value: 'Sans | Returns picture of Sans Undertale.\nHorny/Bonk | Sends user to horny jail.\nCat | Returns image of a cat.'},
                    */{ name: 'Creator', value: 'This bot was made by <@240312568273436674>.\n[Main Server](https://discord.gg/PEGUcb4)\n[Testing Server](https://discord.gg/UJZAKuC4Eh)\n[Website](http://ntgc.ddns.net)\n[Invite](https://discord.com/oauth2/authorize?client_id=795104816753934336&scope=bot&permissions=8)'}
                    )
                message.channel.send(helpEmbed);
        }
    }
}