// return true if tested with relevant mention
export const tagsEveryone = new RegExp(/@everyone/);
export const tagsHere = new RegExp(/@here/);
export const tagsRole = new RegExp(/<@&[0-9]{17,18}>/);
export const tagsUser = new RegExp(/<@!?[0-9]{17,18}>/);

/** Returns `true` if tested on a valid Discord ID (NOT a mention, use `tagsUser` for that). */
export const discordIdTest = new RegExp(/^[0-9]{17,18}$/);

/** Removes Discord decorators (`<`, `>`, `!`, `@`, `&`, `#`) from any form of mention. */
export const stripTagDecorations = (mention: string) => mention.replace(/[<>!@&#]/g, '');

/** Filters out user, role, `@everyone`, and `@here` mentions. */
export function filterMentions(message: string): string {
    return message
        .replace(tagsEveryone, 'everyone')
        .replace(tagsUser, 'user ping')
        .replace(tagsRole, 'role ping')
        .replace(tagsHere, 'here');
}
