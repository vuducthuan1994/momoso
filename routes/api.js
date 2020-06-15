const express = require('express');
let router = express.Router();
const Subscribe = require('../models/subscribeModel');
const Products = require('../models/productModel');

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
    })
});


module.exports = router;