'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SettingSchema = new Schema({
    content: {
        type: Object,
        required: true,
        default: {}
    },
    type: {
        type: String,
        required: true,
        trim: true
    },
    updated_date: {
        type: Date,
        default: Date.now
    }
});

let Settings = mongoose.model('settings', SettingSchema);
module.exports = Settings;