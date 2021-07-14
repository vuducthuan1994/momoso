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
        type: [ {

            urlSeo : String,
            _id: String,
            listImages: Array,
            thumb_cart : String,
            price : String,
            name : String,
            color: String,
            size: String,
            code: String,
            count: Number, // số lượng mua
            quantity: Number // số lượng còn trong kho
        }
        ],
        default: []
    },
    listFavorProducts: {
        type: [
            {
                urlSeo : String,
                _id: String,
                listImages: Array,
                thumb_cart : String,
                price : String,
                name : String,
                code: String,
                quantity: Number // số lượng còn trong kho
            }
        ],
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