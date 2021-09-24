export type ErrorType = 'databaseRead' | 'databaseWrite' | 'databaseBoth';

export const errorMessages: { [index in ErrorType]: string } = {
    databaseRead: `Error occurred querying database, please contact <@240312568273436674>`,
    databaseWrite: `Error occurred updating database, please contact <@240312568273436674>`,
    databaseBoth: `Error occured querying then updating database, this should never happen. Please contact <@240312568273436674>`,
};

export class WhitelistError {
    public errorType: ErrorType;
    public payload: any;
    public message: string;

    constructor(errorType: ErrorType, payload: any) {
        this.errorType = errorType;
        this.payload = payload;
        this.message = errorMessages[errorType];
    }
}

export const maxApplicationsPerPage = 20;
