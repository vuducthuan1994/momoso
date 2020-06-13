const express = require('express');
let router = express.Router();




var isAuthenticated = function(req, res, next) {
    if (process.env.ENV == 'DEV') {
        return next();
    }
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
}

module.exports = function(cache) {

    const cacheController = require('./admin/cache')(cache);
    const configGeneral = require('./admin/config/general')();
    const configBanner = require('./admin/config/banner');
    const about_us = require('./admin/config/about-us');


    const user = require('./admin/users')();
    const posts = require('./admin/posts')();
    const text_sliders = require('./admin/text-sliders')();
    const projects = require('./admin/project')();



    //new 
    router.use('/config/general', configGeneral);
    router.use('/config/banner', configBanner);
    router.use('/config/about-us', about_us);


    // router.use('/hosts', host);
    router.use('/users', user);

    router.use('/text-sliders', text_sliders);
    router.use('/projects', projects);
    router.use('/posts', posts);
    router.use('/cache', cacheController);
    router.get('/', isAuthenticated, function(req, res) {
        res.redirect('/admin/posts');
    });
    return router;
}