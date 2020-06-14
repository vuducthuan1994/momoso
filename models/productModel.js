'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ProductSchema = new Schema({
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
    quantity: {
        type: Number,
        required: true,
        trim: true,
        default: 0
    },
    totalReview: {
        type: Number,
        trim: true,
        default: 0
    },
    rate: {
        type: Number,
        trim: true,
        default: 5
    },
    point: {
        type: Number,
        required: true,
        trim: true,
        default: 100
    },
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        trim: true
    },
    listImages: {
        type: Array,
        required: true,
        default: []
    },
    category: {
        type: Object,
        require: true,
        trim: true,
        default: null
    },
    price: {
        type: Number,
        required: true,
        trim: true,
        default: 0
    },
    detail: {
        type: String,
        trim: true,
        required: true,
        default: ''
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

let Products = mongoose.model('Products', ProductSchema);
module.exports = Products;