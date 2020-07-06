'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var InstagramSchema = new Schema({
    url: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    image: {
        type: String,
        required: true
    },
    created_date: {
        type: Date,
        default: Date.now
    },
    updated_date: {
        type: Date,
        default: Date.now
    }
});

let Instagram = mongoose.model('Instagrams', InstagramSchema);
module.exports = Instagram;