var express = require('express');
var router = express.Router();
const Itunes = require('../../models/ituneModel');


var isAuthenticated = function(req, res, next) {
    // if user is authenticated in the session, call the next() to call the next request handler 
    // Passport adds this method to request object. A middleware is allowed to add properties to
    // request and response objects
    if (req.isAuthenticated())
        return next();
    // if the user is not authenticated then redirect him to the login page
    res.redirect('/login');
}

module.exports = function() {

    router.get('/', function(req, res) {
        Itunes.find({}, function(err, itunes) {
            if (!err) {
                console.log(itunes);
                res.render('admin/pages/itunes/index', { messages: req.flash('messages'), title: "Itunes", itunes: itunes.map(itune => itune.toJSON()), layout: 'admin.hbs' });
            }

        }).sort({ currentTop: -1 });
    });


    router.get('/edit-itune/:id', function(req, res) {
        Itunes.findOne({ _id: req.params.id }, function(err, itune) {
            console.log(itune);
            res.render('admin/pages/itunes/edit-itune', { messages: req.flash('messages'), itune: itune.toJSON(), title: "Edit Itune", layout: 'admin.hbs' });
        });
    });



    router.post('/edit-itune/:id', function(req, res) {
        Itunes.updateOne({ _id: id }, req.config, function(err, callback) {
            if (!err) {
                req.flash('messages', 'Update thành công !')
                res.redirect('back');
            } else {
                req.flash('messages', 'Update không thành công công !')
                res.redirect('back');
            }
        });
    });

    router.get('/add-itune', function(req, res) {
        res.render('admin/pages/itunes/add-client', { title: "Thêm mới Itune", layout: 'admin.hbs' });
    });

    router.post('/add-client', function(req, res) {
        Itunes.create(fields, function(err, data) {
            if (!err) {
                req.flash('messages', 'Thêm thành công !')
                res.redirect('/admin/itunes');

            } else {
                req.flash('messages', 'Không thêm được Itune')
                res.redirect('back');
            }
        });
    });

    router.get('/delete-itune/:id', function(req, res) {
        const id = req.params.id;
        Itunes.remove({
            _id: id,
        }, function(err) {
            if (!err) {
                req.flash('message', 'Delete Itunes Success !')
                res.redirect('back');
            } else {
                req.flash('message', 'Delete Itunes Fail ! !')
                res.redirect('back');
            }
        });
    });

    let updateOrInsert = function(data) {
        Itunes.updateOne({ name: data.name }, data, { upsert: true }, function(err, cb) {
            if (!err) {
                return;
            } else {
                return;
            }
        });
    }
    return router;
}