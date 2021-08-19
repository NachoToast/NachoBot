import Application from '../../../interfaces/Application';
import moment from 'moment';

export default function makeMessage(
    action: string,
    outputChannel: any,
    author: string,
    user: Application,
    reason: string = ''
): void {
    switch (action) {
        case 'accepted':
            outputChannel.send(
                `${user.minecraft} (<@${user.discord}>) has been added to the whitelist by ${author} after ${moment(
                    user.applied
                ).fromNow(true)}.`
            );
            break;
        case 'cleared':
            outputChannel.send(
                `${user.minecraft} (<@${user.discord}>)'s whitelist application has been cleared by ${author}${
                    reason ? ` with reason: ${reason}` : '.'
                }`
            );
            break;
        default:
            outputChannel.send(
                `${user.minecraft} (<@${user.discord}>)'s whitelist application has been ${action} by ${author} after ${moment(
                    user.applied
                ).fromNow(true)}${reason ? ` with reason: ${reason}` : '.'}`
            );
            break;
    }
}
