var express = require('express');
var router = express.Router();
var { validationResult } = require('express-validator');
var { validate } = require('./validator');



module.exports = function(passport) {

    /* GET login page. */
    router.get('/login', function(req, res) {
        const messageError = req.flash('message');
        console.log(messageError);
        // Display the Login page with any flash message, if any
        res.render('admin/login', { title: "Login", layout: false, success: req.flash('success'), messageError: messageError });
    });

    /* Handle Login POST */
    router.post('/login', passport.authenticate('login', {
        successRedirect: '/admin/posts',
        failureRedirect: '/login',
        failureFlash: true
    }));

    /* GET Registration Page */
    router.get('/register', function(req, res) {
        res.render('admin/register', { title: "Đăng ký ", layout: false, message: req.flash('message') });
    });

    /* Handle Registration POST */
    router.post('/register', validate.validateRegisterUser(), function(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('admin/register', { title: "Đăng ký ", errorsValidate: errors.array(), layout: false, message: req.flash('message') });
            return;
        } else {
            passport.authenticate('signup', {
                successRedirect: '/login',
                failureRedirect: '/register',
                failureFlash: true
            })(req, res); // <---- ADDD THIS
        }
    });


    // partial "entity/edit_fields"
    // /* Handle Logout */
    router.get('/signout', function(req, res) {
        console.log("logout");
        req.logout();
        res.redirect('/login');
    });

    return router;
}