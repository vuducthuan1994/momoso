'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var OrderSchema = new Schema({
    phone: {
        type: String,
        required: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    note: {
        type: String,
        required: true,
        trim: true
    },
    listProducts : {
        type: [
            {
                count: Number,
                urlSeo: String,
                code: String,
                color: String,
                size : String,
                price: Number,
            }
        ]
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

let Orders = mongoose.model('Orders', OrderSchema);
module.exports = Orders;