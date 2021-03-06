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
    name_xoa_dau : {
        type: String,
        required: true,
        trim: true
    },
    view: {
        type: Number,
        default: 0
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
        default: 0
    },
    totalOrder: {
        type: Number,
        default: 0
    },
    rate: {
        type: Number,
        trim: true,
        default: 5
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
        default: []
    },
    skus: {
        type: Array,
    },
    blocksColor: {
        type: Array,
        default: []
    },
    blocksSize: {
        type: Array,
        default: []
    },
    thumb_cart: {
        type: String,
        default: '#'
    },
    category: {
        type: [
            {
                name : String,
                _id : String,
                urlSeo: String
            }
        ],
        require: true,
        default: []
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