var express = require('express');
var router = express.Router();
const Clients = require('../../models/clientModel');

const formidable = require('formidable');
var path = require('path');

var isAuthenticated = function(req, res, next) {
    console.log(req.isAuthenticated());
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
        Clients.find({}, function(err, clients) {
            res.render('admin/pages/hosts/index', { title: "Host", clients: clients.map(client => client.toJSON()), layout: 'admin.hbs' });
        }).sort({ updated_date: -1 });
    });


    router.get('/edit-client/:host', function(req, res) {
        Clients.findOne({ host: req.params.host }, function(err, client) {

            res.render('admin/pages/hosts/edit', { messages: req.flash('messages'), client: client.toJSON(), title: "Edit Proxy", layout: 'admin.hbs' });
        });
    });


    router.post('/edit-client/:host', function(req, res) {
        const form = formidable({ multiples: true });

        form.on('fileBegin', function(name, file) {
            if (name == 'home_image' && file.name !== '') {
                file.path = path.join(__basedir, 'public/img/homepage.png');
            }
            if (name == 'logo' && file.name !== '') {
                file.path = path.join(__basedir, 'public/img/logo.png');
            }
        });
        form.parse(req, (err, fields) => {


            if (fields.use_proxy) {
                fields.use_proxy = true;
            } else {
                fields.use_proxy = false;
            }
            console.log(fields);
            if (err) {
                req.flash('messages', "Update khong thanh cong !");
            } else {
                Clients.updateOne({ host: fields.host }, fields, function(err, callback) {
                    if (!err) {
                        req.flash('messages', 'Update thành công !')
                        res.redirect('back');
                    } else {
                        req.flash('messages', 'Update không thành công công !')
                        res.redirect('back');
                    }
                });
            }
        });



    });
    router.get('/add-client', function(req, res) {
        res.render('admin/pages/hosts/add-client', { title: "Thêm mới client", layout: 'admin.hbs' });
    });

    router.post('/add-client', function(req, res) {
        const form = formidable({ multiples: true });

        form.on('fileBegin', function(name, file) {
            if (name == 'home_image' && file.name !== '') {
                file.path = path.join(__basedir, 'public/img/homepage.png');
            }
            if (name == 'logo' && file.name !== '') {
                file.path = path.join(__basedir, 'public/img/logo.png');
            }
        });
        form.parse(req, (err, fields) => {
            if (err) {
                req.flash('messages', "Update khong thanh cong !");
                res.redirect('back');
            } else {
                Clients.create(fields, function(err, data) {
                    if (!err) {
                        req.flash('messages', 'Thêm thành công !')
                        res.redirect('/admin/hosts');

                    } else {
                        req.flash('messages', 'Không thêm được clients')
                        res.redirect('back');
                    }
                });
            }
        });
    });

    router.get('/delete/:id', function(req, res) {
        const id = req.params.id;
        Clients.remove({
            _id: id,
        }, function(err) {
            if (!err) {
                req.flash('message', 'Delete Proxy Success !')
                res.redirect('back');
            } else {
                req.flash('message', 'Delete Proxy Fail ! !')
                res.redirect('back');
            }
        });
    });
    return router;
}