import { Message } from 'discord.js';
import { DENIED_MESSAGES } from '../constants/messages';

export const commentFlag = 'c';
export const behalfFlag = 'for';

/** Gets the comment specified if applicable, or `false` if invalid. */
export function getComment(message: Message, args: string[], isAdmin: boolean, exclusionaryFlag: string | undefined) {
    const attemptedComment = args.indexOf(commentFlag) + 1;
    if (!attemptedComment) return;
    if (!isAdmin) {
        DENIED_MESSAGES.NO_PERMISSION(message);
        return false;
    }
    if (!args[attemptedComment]) {
        DENIED_MESSAGES.NOT_SPECIFIED_COMMENT(message);
        return false;
    }

    if (!!exclusionaryFlag) {
        const otherIndex = args.indexOf(exclusionaryFlag) + 1;
        if (!otherIndex) {
            DENIED_MESSAGES.COMMENT_BUT_NO_BEHALF(message);
            return false;
        }
        if (otherIndex > attemptedComment) {
            DENIED_MESSAGES.COMMENT_NOT_END_ARG(message);
            return false;
        }
    }

    return args.slice(attemptedComment).join(' ');
}
