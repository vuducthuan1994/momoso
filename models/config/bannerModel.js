'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var BannersSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    imageUrl: {
        type: String,
        trim: true,
        default: ''
    },
    desc: {
        type: String,
        trim: true,
        default: ''
    },
    isShow: {
        type: Boolean,
        trim: true,
        default: true
    },
    showText : {
        type: Boolean,
        default: true
    },
    showShopNow:{
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

let Banners = mongoose.model('Banners', BannersSchema);
module.exports = Banners;