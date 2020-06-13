'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ClientSchema = new Schema({
    settings: {
        type: Object,
        required: true,
        default: {}
    },
    created_date: {
        type: Date,
        default: Date.now
    },
    host: {
        type: String,
        required: true,
        trim: true
    },
    top_music: {
        type: Array,
        default: [],
        required: false
    },
    updated_date: {
        type: Date,
        default: Date.now
    },
    use_proxy: {
        type: Boolean,
        default: false
    }
});

let Clients = mongoose.model('clients', ClientSchema);
module.exports = Clients;