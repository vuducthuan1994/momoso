'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CommentSchema = new Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        require: true,
        trim: true
    },
    website: {
        type: String,
        require: true,
        trim: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    urlSeo: {
        type: String,
        required: true,
        trim: true
    },
    created_date: {
        type: Date,
        default: Date.now
    }
});

let Comment = mongoose.model('Comments', CommentSchema);
module.exports = Comment;