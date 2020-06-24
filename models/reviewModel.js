'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ReviewSchema = new Schema({
    sessionID: {
        type: String,
        required: true,
        trim: true
    },
    public: {
        type: Boolean,
        default: false
    },
    URL: {
        type: String,
        required: true
    },
    productID: {
        type: String,
        require: true
    },
    productName: {
        type: String,
        require: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    comment: {
        type: String,
        required: true,
        trim: true,
    },
    rating: {
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