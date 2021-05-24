const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');
const { nacho_token } = require('../../config.json');

module.exports = {
    name: 'nacho',
    async execute(client, interaction) {
        const start = new Date().getTime();
        if (!interaction.channel.nsfw) {
            interaction.reply(`Please use this command in a NSFW channel.`, { ephemeral: true});
            return;
        }
        let io_map = interaction.options.map(e => e.name);
        let request_body = {
            'toaster': nacho_token,
            'args': {
                'size': '..8191'
            }
        };
        if (io_map.indexOf('tags') !== -1) {
            let tag_array = interaction.options[io_map.indexOf('tags')].value.split(",");
            for (let i = 0, len = tag_array.length; i < len; i++) { // tag validation
                tag_array[i] = tag_array[i].replace("! ", "!").replace(" ", "_").replace("-", "").toLowerCase();
                while (tag_array[i].startsWith("_")) {
                    tag_array[i] = tag_array[i].substring(1);
                }
                while (tag_array[i].endsWith("_")) {
                    tag_array[i] = tag_array[i].substring(0, tag_array[i].length - 1);
                }
            }
            request_body.tags = tag_array;
        }
        if (io_map.indexOf('meta') !== -1 && interaction.options[io_map.indexOf('meta')].value === true) var verbose = true;
        else var verbose = false;

        const response = await fetch(`https://nachotoast.com/weeb/api`, {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request_body)
        });
        try {
            var data = await response.json(); 
        } catch (error) {
            interaction.reply(`Error occurred connecting to the API. Try again in: *273 days, 5 hours, and 19 minutes*.`, { ephemeral: true });
            console.log(`${new Date().toLocaleString()}: Error connecting to NachoToast weeb API.`);
            return;
        }
        if (data === undefined || data?.length === 0 || typeof data !== 'object') {
            interaction.reply(`An error occured, monkaW.`);
            console.log(`${new Date().toLocaleString()}: Error getting result from NachoToast weeb API.`);
            return;
        }
        if (data?.fail !== undefined) {
            interaction.reply(data.fail);
            return;
        }
        interaction.reply(`Inbound image...`);
        const image = data.name;
        const embed = new MessageEmbed().setImage(image);
        interaction.channel.send(embed);
        if (data?.tags) var tags = data.tags;
        else var tags = "None";
        setTimeout(function() {
            interaction.editReply(`Tags: ${tags} (${data.size}KB)\nSource: ${data.source}`);
            if (verbose) {
                let metadata = `Uploaded ${((new Date().getTime()/1000 - data.added) / 86400).toFixed(0)} days ago by ${data.uploader}.\nNachoToast.com took ${data.took.toFixed(3)}s to deliver, Discord took ${((new Date().getTime() - start - 1500) / 1000).toFixed(3)}s`;
                interaction.channel.send(metadata);
            }
            if (data?.tag_info) {
                let output = ``;
                for (let i = 0, len = data.tag_info.length; i < len; i++) {
                    if (data.tag_info[i].status == 'Guessed') output += `\nI'm ${data.tag_info[i].confidence}% sure you meant '${data.tag_info[i].tag}'`;
                    else if (data.tag_info[i].status == 'Unknown') output += `\Couldn't find a matching tag for ${data.tag_info[i].tag}`;
                    else if (data.tag_info[i].status == 'Indirect Alias') output += `\nI hope you meant '${data.tag_info[i].tag}' by ${data.tag_info[i].was}`;
                }
                if (output.length > 0) interaction.followUp(output);
            } 
        }, 1500);
        return;
        /*
        const image = response[0].file_url;
        const embed = new MessageEmbed().setImage(image);
        interaction.channel.send(embed);
        interaction.editReply(`Almost there...`);
        setTimeout(function() {
            interaction.editReply(`Degeneracy Delivered 😎`);
        }, 1000);
        */
    },
    async execute_help(client, interaction) {
        interaction.reply(`Gets a random image from the <https://nachotoast.com> weeb API, you can specify **tags** to filter results:\nTags aren't case sensitive, just enter the name of a character or series, e.g. \`zero two\`, you can use an \`!\` to exclude a tag, e.g. \`!megumin\`\nYou can use multiple tags at a time, seperate them with a comma.`);
    }
}