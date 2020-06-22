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
    const configGeneral = require('./admin/config/general');
    const configBanner = require('./admin/config/banner');
    const about_us = require('./admin/config/about-us');
    const storage = require('./admin/storage');
    const category = require('./admin/category');
    const product = require('./admin/product');
    const subscribes = require('./admin/subscribe');
    const review = require('./admin/review');
    const user = require('./admin/users');
    const posts = require('./admin/posts');
    const categoryPost = require('./admin/category-post');



    //new 
    router.use('/config/general', configGeneral);
    router.use('/config/banner', configBanner);
    router.use('/config/about-us', about_us);
    router.use('/storage', storage);
    router.use('/category', category);
    router.use('/product', product);
    router.use('/subscribe', subscribes);
    router.use('/users', user);
    router.use('/review', review);
    router.use('/category-post', categoryPost);

    router.use('/posts', posts);
    router.use('/cache', cacheController);
    router.get('/', isAuthenticated, function(req, res) {
        res.redirect('/admin/posts');
    });
    return router;
}