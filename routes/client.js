const express = require('express');
const Settings = require('../models/settingModel');
const Products = require('../models/productModel');
let router = express.Router();
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: process.env.CACHE_TIME });

router.get('/', async function(req, res) {
    let general = await getGeneralConfig();
    let newProducts = await getNewProducts('chan-ga-goi-dem');
    res.render('client/index', {
        title: "Sửa Thông Tin Kho Hàng",
        layout: 'client.hbs',
        general: general,
        seasonID: req.sessionID,
        newProducts: newProducts
    });
});

router.get(process.env.ABOUT_US, async function(req, res) {
    let general = await getGeneralConfig();
    res.render('client/about-us', {
        title: "About US",
        layout: 'client.hbs',
        general: general,
        seasonID: req.sessionID
    });
});

router.get(`${process.env.PRODUCT}/:url`, async function(req, res) {
    const urlSeo = req.params.url;
    let product = await getProductDetail(urlSeo);
    let general = await getGeneralConfig();
    let productsRelated = await getRelatedProducts(product);
    if (product !== null) {
        res.render('client/product-detail', {
            title: "PRODUCT",
            layout: 'client.hbs',
            product: product.toJSON(),
            general: general,
            seasonID: req.sessionID,
            productsRelated: productsRelated
        });
    } else {
        // returrn 404
    }
});

let getRelatedProducts = function(productItem) {
    const keyCache = 'related' + productItem._id;
    let listURLSeoRelated = [];
    productItem.category.forEach((item) => {
        listURLSeoRelated.push(item.urlSeo);
    });
    return new Promise(function(resolve, reject) {
        let products = cache.get(keyCache);
        if (products == undefined) {
            Products.aggregate([{ $match: { "category": { $elemMatch: { "urlSeo": { $in: ['chan-ga-goi-dem'] } } } } }], function(err, products) {
                if (!err) {
                    resolve(products);
                    cache.set(keyCache, products);
                } else {
                    resolve([]);
                }
            }).limit(15);
        } else {
            resolve(products)
        }
    });
}
let getProductDetail = function(urlSeo) {
    return new Promise(function(resolve, reject) {
        let product = cache.get(urlSeo);
        if (product == undefined) {
            Products.findOne({ urlSeo: urlSeo }, function(err, product) {
                if (!err) {
                    resolve(product)
                    cache.set(urlSeo, product);
                } else {
                    resolve(null)
                }
            });
        } else {
            resolve(product)
        }
    });
}
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