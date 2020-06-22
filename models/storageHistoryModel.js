'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var HistoryStorageSchema = new Schema({
    type: {
        type: String,
        required: true
    },
    product: {
        type: Object,
        required: true
    },
    storage: {
        type: Object,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    size: {
        type: Object,
        required: true
    },
    color: {
        type: Object,
        required: true
    },
    created_date: {
        type: Date,
        default: Date.now
    }
});

let HistoryStorage = mongoose.model('HistorysStorage', HistoryStorageSchema);
module.exports = HistoryStorage;