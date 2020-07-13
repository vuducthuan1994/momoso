'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CategorySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    note: {
        type: String,
        trim: true,
        default: ''
    },
    urlSeo: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    isShow: {
        type: String,
        required: true,
        default: 'on'
    },
    typeImage: {
        type: String,
        required: true,
        default: 'small'
    },
    imageUrl: {
        type: String,
        trim: true,
        default: '#'
    },
    created_date: {
        type: Date,
        default: Date.now
    },
    updated_date: {
        type: Date,
        default: Date.now
    },
    totalProduct: {
        type: Number,
        trim: true,
        default: 0
    }
});

let Category = mongoose.model('Categorys', CategorySchema);
module.exports = Category;