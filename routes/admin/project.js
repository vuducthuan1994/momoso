var express = require('express');
var router = express.Router();
const Settings = require('../../models/settingModel');


const formidable = require('formidable');
var path_image = require('path');


var isAuthenticated = function(req, res, next) {
    if (process.env.ENV == 'DEV') {
        return next();
    }
    if (req.isAuthenticated()) // if the user is not authenticated then redirect him to the login page
        res.redirect('/');
}

module.exports = function() {

    router.get('/', isAuthenticated, function(req, res) {
        Settings.findOne({ type: 'projects' }, function(err, projects) {
            if (!err) {
                res.render('admin/pages/projects/index', { messages: req.flash('messages'), title: "Giới thiệu các dự án khác", projects: projects.toJSON(), layout: 'admin.hbs' });
            }
        });
    });
    router.post('/', isAuthenticated, function(req, res) {
        const form = formidable({ multiples: true });
        form.on('fileBegin', function(name, file) {
            if (file.name !== '') {
                file.path = path_image.join(__basedir, `public/img/${name}.png`);
            }
        });
        form.parse(req, (err, fields) => {

            if (err) {
                req.flash('messages', "Update không thành công !");
            } else {
                Settings.updateOne({ type: 'projects' }, { content: fields }, function(err, data) {
                    if (!err) {
                        req.flash('messages', 'Update thành công !')
                        res.redirect('back');
                    } else {
                        req.flash('messages', 'Update không thành công !')
                        res.redirect('back');
                    }
                });
            }
        });
    });

    return router;
}