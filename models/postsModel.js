'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PostsSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    body: {
        type: String,
        trim: true,
        default: ''
    },
    banner_image: {
        type: String,
        trim: true,
        default: '#'
    },
    thumb_image: {
        type: String,
        trim: true,
        default: '#'
    },
    user: {
        type: Object,
        required: false
    },
    edit_by: {
        type: Object,
        required: false
    },
    short_desc: {
        type: String,
        default: '',
        trim: true
    },
    fb_link: {
        type: String,
        trim: true
    },
    isPublic: {
        type: Boolean,
        default: true
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

let Posts = mongoose.model('Posts', PostsSchema);
module.exports = Posts;