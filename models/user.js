const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    minecraft: {
        type: String,
        required: true,
    },
    discord: {
        type: String,
        required: true,
    },
    applied: {
        type: Date,
        default: new Date().toISOString(),
    },
});

module.exports = mongoose.model('whitelistApplications', userSchema);
