import { commentFlag, behalfFlag } from '../helpers/flags';

export const exampleUses: { [index: string]: string[] } = {
    accept: [
        'whitelist accept NachoToast',
        'w a <@240312568273436674>',
        'whitelist a nAcHoToAsT',
        'w accept 240312568273436674 c They are very cool',
    ],
    apply: [
        'whitelist NachoToast',
        'w tOasTNaCHo',
        'whitelist apply nachotaost',
        'w NachoToast **for <@240312568273436674> c Not at computer atm**',
    ],
    ban: [
        'whitelist ban <@240312568273436674> c griefing and killing players',
        "w b nachotoast c isn't very poggers",
        'w b TOASTNACHO',
    ],
    clear: ['whitelist clear nachotoast', 'w c <@240312568273436674> hi guys', 'w c nachotoast c they changed their username'],
    freeze: ['whitelist freeze nachotoast', 'w f <@240312568273436674> c too hot'],
    info: ['whitelist info', 'whitelist info nachotoast', 'w i <@240312568273436674>'],
    list: ['whitelist list 2', 'whitelist l pending', 'w list 2 pending', 'w l accepted'],
    listcommands: ['whitelist listcommands', 'whitelist commands', 'whitelist cl'],
    reject: ['whitelist reject <@240312568273436674>', 'w reject nachotoast', 'w reject NACHOTOASt c known duplicate account'],
    remove: ['whitelist remove', 'w r'],
    stats: ['whitelist stats', 'w stats', 'you really need another example?'],
    status: ['whitelist status', 'w s nachotoast', 'w status <@240312568273436674>'],
    suspend: ['whitelist suspend', 'w sus', 'haha funny among us', 'w sus on'],
};

// neko whitelist accept NachoToast c pog champ
// neko whitelist apply NachoToast for 1234589 c pog champ
const standardAdminWithComment = [`<minecraft> ${commentFlag} <comment>`, `<discord> ${commentFlag} <comment>`];
export const usages: { [index: string]: string[] } = {
    accept: standardAdminWithComment,
    apply: [
        `<minecraft>`,
        `<minecraft> **${behalfFlag} <discord>**`,
        `<minecraft> **${behalfFlag} <discord> ${commentFlag} <comment>**`,
    ],
    ban: standardAdminWithComment,
    clear: standardAdminWithComment,
    freeze: standardAdminWithComment,
    info: [``, `<minecraft>`, `<discord>`],
    list: [`<status>`, `<page>`, `<status> <page>`],
    listCommands: [``],
    reject: standardAdminWithComment,
    remove: [``],
    stats: [``],
    status: [``, `<discord>`, `<minecraft>`],
    suspend: [``, `**on**`, `**off**`],
};
