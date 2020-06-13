var express = require('express');
var router = express.Router();
const Settings = require('../../models/settingModel');


const formidable = require('formidable');
var path_image = require('path');


var isAuthenticated = function(req, res, next) {
    if (process.env.ENV == 'DEV') {
        return next();
    }
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}

module.exports = function() {

    router.get('/', isAuthenticated, function(req, res) {
        Settings.findOne({ type: 'text-sliders' }, function(err, textSliders) {
            if (!err) {
                res.render('admin/pages/text-sliders/index', { messages: req.flash('messages'), title: "Chỉnh sửa text Sliders", textSliders: textSliders.toJSON(), layout: 'admin.hbs' });
            }
        });
    });
    router.post('/', isAuthenticated, function(req, res) {
        Settings.updateOne({ type: 'text-sliders' }, { content: req.body.content }, function(err, data) {
            if (!err) {
                req.flash('messages', 'Update thành công !')
            } else {
                req.flash('messages', 'Update không thành công công !')
            }
            res.redirect('back');
        });

    });

    return router;
}