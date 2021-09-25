import { Statuses } from '../../../../models/user';

const DEFAULT_LOG_COMMENTS: { [index in Statuses]: string } = {
    pending: 'Initial application',
    accepted: 'Accepted their whitelist application',
    rejected: 'No reason specified',
    frozen: 'No reason specified',
    banned: 'No reason specified',
};

export default DEFAULT_LOG_COMMENTS;
