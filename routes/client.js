const express = require('express');
const Settings = require('../models/settingModel');
const Products = require('../models/productModel');
const Banners = require('../models/config/bannerModel');
const Carts = require('../models/cartModel');
let router = express.Router();
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: process.env.CACHE_TIME });

router.get('/', async function(req, res) {
    let general = await getGeneralConfig();
    let newProducts = await getNewProducts();
    let cart = await getCart(req.sessionID);
    let banners = await getBanners();
    res.render('client/index', {
        title: "Trang chu",
        layout: 'client.hbs',
        general: general,
        sessionID: req.sessionID,
        newProducts: newProducts,
        cart: cart ? cart.toJSON() : null,
        banners: banners.map(banner => banner.toJSON())
    });
});

router.get(process.env.ABOUT_US, async function(req, res) {
    let general = await getGeneralConfig();
    let about_us = await getAboutUsInfo();
    let cart = await getCart(req.sessionID);
    res.render('client/about-us', {
        title: "About US",
        layout: 'client.hbs',
        general: general,
        seasonID: req.sessionID,
        about_us: about_us,
        cart: cart ? cart.toJSON() : null
    });
});

router.get(process.env.CART, async function(req, res) {
    let general = await getGeneralConfig();
    let about_us = await getAboutUsInfo();
    let cart = await getCart(req.sessionID);
    res.render('client/cart', {
        title: "About US",
        layout: 'client.hbs',
        general: general,
        seasonID: req.sessionID,
        about_us: about_us,
        cart: cart ? cart.toJSON() : null
    });
});

router.get(process.env.FAVOR_LIST, async function(req, res) {
    let general = await getGeneralConfig();
    let cart = await getCart(req.sessionID);
    res.render('client/favor-list', {
        title: "favor-list",
        layout: 'client.hbs',
        general: general,
        sessionID: req.sessionID,
        cart: cart ? cart.toJSON() : null
    });
});

router.get(`${process.env.PRODUCT}/:url`, async function(req, res) {
    const urlSeo = req.params.url;
    let product = await getProductDetail(urlSeo);
    let general = await getGeneralConfig();
    let productsRelated = await getRelatedProducts(product);

    let cart = await getCart(req.sessionID);
    if (product !== null) {
        res.render('client/product-detail', {
            title: "PRODUCT",
            layout: 'client.hbs',
            product: product.toJSON(),
            general: general,
            sessionID: req.sessionID,
            productsRelated: productsRelated,
            cart: cart ? cart.toJSON() : null
        });
    } else {
        // returrn 404
    }
});

let getCart = function(sessionID) {
    return new Promise(function(resolve, reject) {
        Carts.findOne({ sessionID: sessionID }, function(err, cart) {
            console.log(cart);

            resolve(cart);

        });
    });

}

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
            Products.findOneAndUpdate({ urlSeo: urlSeo }, { $inc: { view: 1 } }, function(err, product) {
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

let getBanners = function() {
    return new Promise(function(resolve, reject) {
        let banners = cache.get("banners");
        if (banners == undefined) {
            Banners.find({ isShow: true }, function(err, banners) {
                if (!err) {
                    resolve(banners);
                    cache.set("banners", banners);
                } else {
                    resolve([]);
                }
            });
        } else {
            resolve(banners)
        }
    });
}
let getAboutUsInfo = function() {
    return new Promise(function(resolve, reject) {
        let about_us = cache.get("about-us");
        if (about_us == undefined) {
            Settings.findOne({ type: 'about-us' }, function(err, about_us) {
                if (!err) {
                    resolve(about_us.content);
                    cache.set("about-us", about_us.content);
                }
            });
        } else {
            resolve(about_us)
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
            }).limit(50).sort({ created_date: -1 });
        } else {
            resolve(newProducts)
        }
    });
}


module.exports = router;