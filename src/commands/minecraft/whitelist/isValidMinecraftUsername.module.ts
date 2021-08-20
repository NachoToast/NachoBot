const invalidUsernameChars: RegExp = new RegExp(/[^a-zA-Z0-9_]/, 'g'); // match anything besides a-z, A-Z, 0-9 , and _

function isValidUsername(username: any): boolean {
    if (typeof username !== 'string') return false;
    if (username.length < 3 || username.length > 16) return false;
    if (invalidUsernameChars.test(username)) return false;
    return true;
}

export default isValidUsername;
