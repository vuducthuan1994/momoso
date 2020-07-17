'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PostsSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    urlSeo: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    view: {
        type: Number,
        default: 0
    },
    comment: {
        type: Number,
        default: 0
    },
    body: {
        type: String,
        trim: true,
        default: ''
    },
    banner_image: {
        type: String,
        trim: true,
        default: null
    },
    recent_image: {
        type: String,
        trim: true,
        default: null
    },
    user: {
        type: Object,
        default: null
    },
    thumb_image: {
        type: String,
        trim: true,
        default: null
    },
    category: {
        type: Array,
        default: []
    },
    edit_by: {
        type: Object
    },
    short_desc: {
        type: String,
        default: '',
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