const tagsEveryone = new RegExp(/@everyone/, 'g');
const tagsUser = new RegExp(/<@!?[0-9]{17,}>/, 'g');
const tagsRole = new RegExp('<@&[0-9]{17,}>', 'g');
const tagsHere = new RegExp(/@here/, 'g');

function filterMessage(message: string): string {
    return message
        .replace(tagsEveryone, 'everyone')
        .replace(tagsUser, 'user ping')
        .replace(tagsRole, 'role ping')
        .replace(tagsHere, 'here');
}

export default filterMessage;
