const express = require('express');
let router = express.Router();
const Subscribe = require('../models/subscribeModel');
const Products = require('../models/productModel');
const Carts = require('../models/cartModel');
const Reviews = require('../models/reviewModel');
const rateLimit = require("express-rate-limit");
const reviewLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

router.post('/subscribe', function(req, res) {
    Subscribe.create(req.body, function(err, data) {
        if (!err) {
            res.json({
                success: true
            });
        } else {
            res.json({
                success: false
            });
        }
    });
});

router.post('/createReview', reviewLimiter, function(req, res) {
    Reviews.create(req.body, function(err, data) {
        if (!err) {
            res.json({
                success: true
            });
        } else {
            res.json({
                success: false
            });
        }
    });
});

router.post('/addToCart', function(req, res) {
    Carts.findOneAndUpdate({ sessionID: req.body.sessionID, "listCartProducts._id": { $ne: req.body.product._id } }, { $push: { "listCartProducts": req.body.product } }, { upsert: true, new: true }, function(err, data) {
        if (!err) {
            console.log(data);
            res.json({
                success: true,
                msg: 'Cập nhật giỏ hàng thành công !',
                lengthCart: data.listCartProducts.length
            });
        } else {
            console.log(err);
            res.json({
                success: false,
                msg: 'Không cập nhật được giỏ hàng !'
            });
        }
    });
});

router.post('/removeFromCart', function(req, res) {
    Carts.findOneAndUpdate({ sessionID: req.body.sessionID }, { $pull: { "listCartProducts": { _id: req.body._id } } }, { upsert: true, new: true }, function(err, data) {
        if (!err) {
            console.log(data);
            res.json({
                success: true,
                msg: 'Xóa sản phẩm khỏi giỏ hàng thành công',
                lengthCart: data.listCartProducts.length
            });
        } else {
            console.log(err);
            res.json({
                success: false,
                msg: 'Không cập nhật được giỏ hàng !'
            });
        }
    });
});

router.post('/updateFavor', function(req, res) {
    Carts.findOneAndUpdate({ sessionID: req.body.sessionID }, req.body, { upsert: true }, function(err, cart) {
        if (!err) {
            res.json({
                success: true,
                cart: cart,
                msg: 'Cập nhật danh sách ưa thích thành công !'
            });
        } else {
            res.json({
                success: false,
                msg: 'Không cập nhật được danh sách ưa thích !'
            });
        }
    });
});

router.get('/product/:id', function(req, res) {
    const idProduct = req.params.id;
    Products.findOne({ _id: idProduct }, function(err, product) {
        if (!err) {
            console.log(product);
            res.json({
                success: true,
                data: product
            });
        } else {
            res.json({
                success: false,
                data: err
            });
        }
    });
});


module.exports = router;