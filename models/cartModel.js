'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CartSchema = new Schema({
    sessionID: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    listCartProducts: {
        type: Array,
        default: []
    },
    listFavorProducts: {
        type: Array,
        default: []
    },
    listTotals: {
        type: Array,
        default: []
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

let Cart = mongoose.model('Carts', CartSchema);
module.exports = Cart;