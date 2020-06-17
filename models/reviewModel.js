'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ReviewSchema = new Schema({
    sessionID: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    product: {
        type: Object,
        require: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true,
        trim: true,
    },
    rate: {
        type: Number,
        trim: true,
        required: true
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

let Review = mongoose.model('Reviews', ReviewSchema);
module.exports = Review;