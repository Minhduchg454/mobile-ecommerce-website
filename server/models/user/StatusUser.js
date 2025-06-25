// models/StatusUser.js
const mongoose = require('mongoose');

const statusUserSchema = new mongoose.Schema({
    statusUserName: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('StatusUser', statusUserSchema);