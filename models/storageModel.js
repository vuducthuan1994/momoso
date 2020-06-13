'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var StorageSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        trim: true,
        default: ''
    },
    phone_number: {
        type: Number,
        trim: true,
        default: ''
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