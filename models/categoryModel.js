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
    urlSeo: {
        type: String,
        required: true,
        unique: true,
        trim: true
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
        required: false,
        trim: true,
        default: 0
    }
});

let Category = mongoose.model('Categorys', CategorySchema);
module.exports = Category;