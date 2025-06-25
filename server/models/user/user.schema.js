const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true
    },
    avatar: String,
    mobile: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    roleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
        required: true
    },
    userName: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        unique: true,
        required: true
    },
    statusUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StatusUser',
        required: true
    }
}, {
    timestamps: true
});

module.exports = userSchema;
