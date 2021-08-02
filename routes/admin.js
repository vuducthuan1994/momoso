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
    const text = require('./admin/config/text');
    const order = require('./admin/order');
    const category = require('./admin/category');
    const product = require('./admin/product');
    const subscribes = require('./admin/subscribe');
    const review = require('./admin/review');
    const user = require('./admin/users');
    const posts = require('./admin/posts');
    const categoryPost = require('./admin/category-post');
    const contact = require('./admin/contact');
    const instagram = require('./admin/instagram');

    //new 
    router.use('/config/general', configGeneral);
    router.use('/config/banner', configBanner);
    router.use('/config/text', text);
    router.use('/order', order);
    router.use('/category', category);
    router.use('/product', product);
    router.use('/subscribe', subscribes);
    router.use('/users', user);
    router.use('/review', review);
    router.use('/contact', contact);
    router.use('/category-post', categoryPost);
    router.use('/instagram', instagram);
    router.use('/posts', posts);
    router.use('/cache', cacheController);
    router.get('/', isAuthenticated, function(req, res) {
        res.redirect('/admin/posts');
    });
    return router;
}