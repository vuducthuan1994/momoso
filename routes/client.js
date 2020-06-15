const express = require('express');
const Settings = require('../models/settingModel');
const Products = require('../models/productModel');
let router = express.Router();
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: process.env.CACHE_TIME });

router.get('/', async function(req, res) {
    let general = await getGeneralConfig();
    let newProducts = await getNewProducts();
    console.log(newProducts);
    res.render('client/index', {
        title: "Sửa Thông Tin Kho Hàng",
        layout: 'client.hbs',
        general: general,
        seasonID: req.sessionID,
        newProducts: newProducts
    });
});

router.get('/about-us', async function(req, res) {
    let general = await getGeneralConfig();
    res.render('client/about-us', {
        title: "About US",
        layout: 'client.hbs',
        general: general,
        seasonID: req.sessionID
    });
});

let getGeneralConfig = function() {
    return new Promise(function(resolve, reject) {
        let general = cache.get("general");
        if (general == undefined) {
            Settings.findOne({ type: 'general' }, function(err, general) {
                if (!err) {
                    resolve(general.content);
                    cache.set("general", general.content);
                }
            });
        } else {
            resolve(general)
        }
    });
}

let getNewProducts = function() {
    return new Promise(function(resolve, reject) {
        let newProducts = cache.get("newProducts");
        if (newProducts == undefined) {
            let results = [];
            Products.find({ type: 'new' }, function(err, products) {
                if (!err) {
                    var totalProduct = products.length;
                    if (products.length % 2 !== 0) {
                        totalProduct -= 1;
                    }
                    for (let index = 0; index < totalProduct; index = index + 2) {
                        results.push({
                            one: products[index].toJSON(),
                            two: products[index + 1].toJSON()
                        });
                    }
                    resolve(results);
                    cache.set("newProducts", results);
                }
            }).limit(50);
        } else {
            resolve(newProducts)
        }
    });
}


module.exports = router;