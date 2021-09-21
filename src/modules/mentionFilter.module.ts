const tagsEveryone = new RegExp(/@everyone/);
export const tagsUser = new RegExp(/<@!?[0-9]{17,}>/);
export const removeUserTags = (mention: string) => mention.replace(/[<>!@]/g, '');
const tagsRole = new RegExp(/<@&[0-9]{17,}>/);
const tagsHere = new RegExp(/@here/);

export const discordIdTest = new RegExp(/[^0-9]/);

function filterMessage(message: string): string {
    return message
        .replace(tagsEveryone, 'everyone')
        .replace(tagsUser, 'user ping')
        .replace(tagsRole, 'role ping')
        .replace(tagsHere, 'here');
}

export default filterMessage;
