const config = require('../../config.json');

module.exports = async (client) => {
    for (let i = 0; i < config.reactRoles.length; i++) { // For specified channel.
        const channel = await client.channels.fetch(config.reactRoles[i].channel)

        for (let j = 0; j < config.reactRoles[i].messages.length; j++) { // For each specified message.
            const message = await channel.messages.fetch(config.reactRoles[i].messages[j].id);
            let messageContent = `**${config.reactRoles[i].messages[j].header}**\n`;
            for (let k = 0; k < config.reactRoles[i].messages[j].reactions.length; k++) { // For each reaction option.
                    message.react(config.reactRoles[i].messages[j].reactions[k].emote);
                    if (config.reactRoles[i].messages[j].reactions[k].custom == true) {
                        messageContent += `${config.reactRoles[i].messages[j].reactions[k].emote2} ${config.reactRoles[i].messages[j].reactions[k].desc}\n\n`;
                    }
                    else messageContent += `${config.reactRoles[i].messages[j].reactions[k].emote} ${config.reactRoles[i].messages[j].reactions[k].desc}\n\n`;
            }
            if (config.reactRoles[i].messages[j].bonusText) messageContent += `*${config.reactRoles[i].messages[j].bonusText}*`;
            message.edit(messageContent);
        }
    }
    client.on('messageReactionAdd', (reaction, user) => {
        if (reaction.me == true) return;
        let i = config.reactRoles.map(function(e) {return e.channel}).indexOf(reaction.message.channel.id);
        if (i !== -1) { // If right channel.
            let j = config.reactRoles[i].messages.map(function(e) {return e.id}).indexOf(reaction.message.id);
            if (j !== -1) { // If right message.
                let k = config.reactRoles[i].messages[j].reactions.map(function(e) {return e.emote}).indexOf(reaction.emoji.toString());
                let k2 = config.reactRoles[i].messages[j].reactions.map(function(e) {return e.emote2}).indexOf(reaction.emoji.toString());
                if(k !== -1 || k2 !== -1) { // If right reaction.
                    if (k2 !== -1) k = k2;
                    let { guild } = reaction.message;
                    let role = guild.roles.cache.find((role) => role.id == config.reactRoles[i].messages[j].reactions[k].role);
                    let member = guild.members.cache.find((member) => member.id == user.id);
                    if (config.reactRoles[i].messages[j].mutuallyExclusive == true) {
                        for (let l = 0; l < config.reactRoles[i].messages[j].reactions.length; l++) {
                            if (member.roles.cache.some(role => role.id == config.reactRoles[i].messages[j].reactions[l].role)) {
                                user.send(`Sorry, but the **${config.reactRoles[i].messages[j].reactions[k].desc}** role is mutually exclusive with the others in the '${config.reactRoles[i].messages[j].header}' role list.\nIf you accidentally selected the wrong role, please contact an admin.`);
                                reaction.users.remove(user.id);
                                return;
                            }
                        }
                    }
                    member.roles.add(role, "React Roles (React)");
                }
            }
        }
    })
    client.on('messageReactionRemove', (reaction, user) => {
        if (reaction.me == true) return;
        let i = config.reactRoles.map(function(e) {return e.channel}).indexOf(reaction.message.channel.id);
        if (i !== -1) { // If right channel.
            let j = config.reactRoles[i].messages.map(function(e) {return e.id}).indexOf(reaction.message.id);
            if (j !== -1) { // If right message.
                let k = config.reactRoles[i].messages[j].reactions.map(function(e) {return e.emote}).indexOf(reaction.emoji.toString());
                let k2 = config.reactRoles[i].messages[j].reactions.map(function(e) {return e.emote2}).indexOf(reaction.emoji.toString());
                if(k !== -1 || k2 !== -1) { // If right reaction.
                    if (k2 !== -1) k = k2;
                    if (config.reactRoles[i].messages[j].removable == false) { // Irremovable Roles
                        user.send(`Sorry, but you cannot remove the **${config.reactRoles[i].messages[j].reactions[k].desc}** role from yourself!\nIf you mistakenly selected this role, please contact an admin.`);
                        reaction.users.remove(user.id);
                        return;
                    }
                    let { guild } = reaction.message;
                    let role = guild.roles.cache.find((role) => role.id == config.reactRoles[i].messages[j].reactions[k].role);
                    let member = guild.members.cache.find((member) => member.id == user.id);
                    member.roles.remove(role, "React Roles (Unreact)");
                }
            }
        }
    })
}