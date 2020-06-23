const express = require('express');
const Settings = require('../models/settingModel');
const Products = require('../models/productModel');
const Posts = require('../models/postsModel');
const Banners = require('../models/config/bannerModel');
const Categorys = require('../models/categoryModel');
const Carts = require('../models/cartModel');
let router = express.Router();
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: process.env.CACHE_TIME });

router.get('/', async function(req, res) {
    let general = await getGeneralConfig();
    let newProducts = await getNewProducts();
    let cart = await getCart(req.sessionID);
    let banners = await getBanners();
    let categorys = await getCategorys();
    let bestSellerProduct = await getBestSellerProduct();
    let newPosts = await getPosts();
    res.render('client/index', {
        title: "Trang chu",
        layout: 'client.hbs',
        general: general,
        sessionID: req.sessionID,
        newProducts: newProducts,
        categorys: categorys,
        cart: cart ? cart.toJSON() : null,
        bestSellerProduct: bestSellerProduct.map(product => product.toJSON()),
        banners: banners.map(banner => banner.toJSON()),
        newPosts: newPosts.map(post => post.toJSON())
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

router.get(process.env.CHECK_OUT, async function(req, res) {
    let general = await getGeneralConfig();
    let cart = await getCart(req.sessionID);
    res.render('client/check-out', {
        title: "Đặt hàng ngay",
        layout: 'client.hbs',
        general: general,
        seasonID: req.sessionID,
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

let getCategorys = function() {
    return new Promise(function(resolve, reject) {
        let categorysOnIndex = cache.get("categorysOnIndex");
        if (categorysOnIndex == undefined) {
            Categorys.find({ isShow: 'on' }, function(err, categorys) {
                if (!err) {
                    let results = [];
                    let smallIndex = 0;
                    let bigIndex = 1;
                    for (var i in categorys) {
                        if (categorys[i].typeImage == 'small') {
                            results[smallIndex] = categorys[i].toJSON();
                            if (smallIndex % 2 == 0) {
                                smallIndex = smallIndex + 3;
                            } else {
                                smallIndex = smallIndex + 1;
                            }
                        }
                        if (categorys[i].typeImage == 'big') {
                            results[bigIndex] = categorys[i].toJSON();
                            if (bigIndex % 2 !== 0) {
                                bigIndex = bigIndex + 1;
                            } else {
                                bigIndex = bigIndex + 3;
                            }
                        }
                    }
                    resolve(results);
                } else {
                    resolve([]);
                }
            }).limit(15);
        } else {
            resolve(categorysOnIndex);
        }
    });
}

let getBestSellerProduct = function() {
    return new Promise(function(resolve, reject) {
        let bestSellerProduct = cache.get("bestSeller");
        if (bestSellerProduct == undefined) {
            Products.find({ type: 'new' }, function(err, products) {
                if (!err) {
                    resolve(products);
                    cache.set("bestSeller", products);
                } else {
                    resolve([]);
                }
            }).limit(10).sort({ created_date: -1 });
        } else {
            resolve(bestSellerProduct)
        }
    });
}
let getPosts = function() {
    return new Promise(function(resolve, reject) {
        let newPosts = cache.get("lastPosts");
        if (newPosts == undefined) {
            Posts.find({ isPublic: true }, function(err, posts) {
                if (!err) {
                    resolve(posts);
                    cache.set("lastPosts", posts);
                }
            }).limit(20).sort({ updated_date: -1 });
        } else {
            resolve(newPosts);
        }
    })
}
let getNewProducts = function() {
    return new Promise(function(resolve, reject) {
        let newProducts = cache.get("newProducts");
        if (newProducts == undefined) {
            let results = [];
            Products.find({ type: 'new' }, { category: 0, note: 0, detail: 0, created_date: 0, updated_date: 0, view: 0, blocksSize: 0, blocksColor: 0, point: 0, __v: 0, totalReview: 0, rate: 0, code: 0 }, function(err, products) {
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