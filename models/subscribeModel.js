'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SubscribeSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
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

let Subscribe = mongoose.model('Subscribes', SubscribeSchema);
module.exports = Subscribe;