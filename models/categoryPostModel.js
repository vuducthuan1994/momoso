'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CategoryPostSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    urlSeo: {
        type: String,
        required: true,
        unique: true,
        trim: true
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

let CategoryPost = mongoose.model('CategorysPost', CategoryPostSchema);
module.exports = CategoryPost;