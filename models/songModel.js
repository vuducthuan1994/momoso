'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SongSchema = new Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },
    top: {
        type: Boolean,
        default: false
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


let Songs = mongoose.model('songs', SongSchema);
module.exports = Songs;