'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var StorageSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    shortcutName: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true,
        default: ''
    },
    phone_number: {
        type: Number,
        trim: true,
        default: '0356125026'
    },
    note: {
        type: String,
        trim: true,
        default: ''
    },
    created_date: {
        type: Date,
        default: Date.now
    },
    updated_date: {
        type: Date,
        default: Date.now
    },
});

let Storage = mongoose.model('Storages', StorageSchema);
module.exports = Storage;