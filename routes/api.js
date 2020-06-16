const express = require('express');
let router = express.Router();
const Subscribe = require('../models/subscribeModel');
const Products = require('../models/productModel');
const Carts = require('../models/cartModel');

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
    })
});

router.post('/updateCart', function(req, res) {
    console.log(req.body)
    Carts.findOneAndUpdate({ sessionID: req.body.sessionID }, req.body, { upsert: true }, function(err, data) {
        if (!err) {
            res.json({
                success: true,
                msg: 'Cập nhật giỏ hàng thành công !'
            });
        } else {
            res.json({
                success: false,
                msg: 'Không cập nhật được giỏ hàng !'
            });
        }
    });
});

router.post('/updateFavor', function(req, res) {
    console.log(req.body)
    Carts.findOneAndUpdate({ sessionID: req.body.sessionID }, req.body, { upsert: true }, function(err, data) {
        if (!err) {
            res.json({
                success: true,
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