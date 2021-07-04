const express = require('express');
const Settings = require('../models/settingModel');
const Products = require('../models/productModel');
const Posts = require('../models/postsModel');
const Banners = require('../models/config/bannerModel');
const Categorys = require('../models/categoryModel');
const Carts = require('../models/cartModel');
const Review = require('../models/reviewModel');
const Instagram = require('../models/instagramModel');
let router = express.Router();
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: process.env.CACHE_TIME });

const fullTextSearch = require('fulltextsearch');
var fullTextSearchVi = fullTextSearch.vi;

router.post(process.env.SEARCH, async function(req, res) {

    if (req.body.search) {
        let keyword = new RegExp(fullTextSearchVi(req.body.search), "i");
        Products.find({ $or: [{ name: keyword }, { code: keyword }] }, async function(err, products) {
            // console.log(products);
            // console.log(err);
            if (!err) {
                let mostViewProducts = await getMostViewProduct();
                let allCategory = await getAllCategory();
                let treeMenu = await getTreeMenu();
                let general = await getGeneralConfig();
                let cart = await getCart(req.sessionID);
                res.render('client/search', {
                    keyword: req.body.search,
                    title: `${general.title_home} - Tìm Kiếm ${req.body.search}`,
                    imagePreview: "https://momostudio.vn/img/home_image.png",
                    layout: 'client.hbs',
                    general: general,
                    cart: cart ? cart.toJSON() : null,
                    allCategory: allCategory.map(item => item.toJSON()),
                    products: products.map(item => item.toJSON()),
                    currentUrl: process.env.R_BASE_IMAGE,
                    treeMenu: treeMenu,
                    mostViewProducts: mostViewProducts,
                });
            }
        });
    } else {
        res.redirect('/');
    }
});
router.get('/', async function(req, res) {
    let general = await getGeneralConfig();
    let treeMenu = await getTreeMenu();
    let newProducts = await getNewProducts();
    let cart = await getCart(req.sessionID);
    let banners = await getBanners();
    let categorys = await getCategorys();
    let bestSellerProduct = await getBestSellerProduct();
    let newPosts = await getPosts(20);
    let allCategory = await getAllCategory();
    let instagrams = await getInstagram();
    res.render('client/index', {
        title: general.title_home,
        imagePreview: "https://momostudio.vn/img/home_image.png",
        layout: 'client.hbs',
        general: general,
        newProducts: newProducts,
        categorys: categorys,
        cart: cart ? cart.toJSON() : null,
        bestSellerProduct: bestSellerProduct.map(product => product.toJSON()),
        banners: banners.map(banner => banner.toJSON()),
        newPosts: newPosts.map(post => post.toJSON()),
        allCategory: allCategory.map(item => item.toJSON()),
        instagrams: instagrams.map(item => item.toJSON()),
        currentUrl: process.env.R_BASE_IMAGE,
        treeMenu: treeMenu
    });
});

router.get(process.env.ABOUT_US, async function(req, res) {
    let general = await getGeneralConfig();
    let about_us = await getAboutUsInfo();
    let cart = await getCart(req.sessionID);
    let treeMenu = await getTreeMenu();
    console.log("hahaha")
    res.render('client/about-us', {
        title: general.title_home + ' - ' + "About US",
        layout: 'client.hbs',
        general: general,
        about_us: about_us,
        cart: cart ? cart.toJSON() : null,
        treeMenu: treeMenu
    });
});

router.get(`${process.env.CATEGORY_PRODUCT}/:url`, async function(req, res) {
    let treeMenu = await getTreeMenu();

    const urlSeo = req.params.url;
    const pageSize = req.query.pageSize ? JSON.parse(req.query.pageSize) : 9;
    const sortType = req.query.sortType ? JSON.parse(req.query.sortType) : 0;
    const currentPage = req.query.page ? JSON.parse(req.query.page) : 1;
    const minPrice = req.query.minPrice ? JSON.parse(req.query.minPrice) : 100000;
    const maxPrice = req.query.maxPrice ? JSON.parse(req.query.maxPrice) : 3000000;

    let postsByCategory = await getPostByCategory(urlSeo, pageSize, currentPage, sortType, minPrice, maxPrice);
    let categoryDetail = await getCategoryDetail(urlSeo);
    let general = await getGeneralConfig();
    let cart = await getCart(req.sessionID);
    let mostViewProducts = await getMostViewProduct();
    let allCategory = await getAllCategory();
    res.render('client/category-product', {
        title: general.title_home + ' - ' + categoryDetail.name,
        imagePreview: process.env.R_BASE_IMAGE + categoryDetail.imageUrl,
        layout: 'client.hbs',
        general: general,
        categoryDetail: categoryDetail,
        cart: cart ? cart.toJSON() : null,
        pageInfo: postsByCategory[0].pageInfo[0],
        products: postsByCategory[0].edges,
        currentPage: currentPage,
        pageSize: pageSize,
        sortType: sortType,
        mostViewProducts: mostViewProducts,
        allCategory: allCategory.map(item => item.toJSON()),
        currentURlSeo: urlSeo,
        minPrice: minPrice,
        maxPrice: maxPrice,
        currentUrl: process.env.R_BASE_IMAGE + req.url,
        treeMenu: treeMenu
    });
});


let getInstagram = function() {
    return new Promise(function(reslove, reject) {
        const instagrams = cache.get('instagrams');
        if (instagrams == undefined) {
            Instagram.find({}, function(err, instagrams) {

                if (!err) {
                    reslove(instagrams);
                    cache.set('instagrams', instagrams);
                } else {
                    reslove([]);
                }
            }).sort({ updated_date: -1 }).limit(20);
        } else {
            reslove(instagrams);
        }
    });
}


let getMostViewProduct = function() {
    return new Promise(function(reslove, reject) {
        const mostViewProducts = cache.get('mostViewProduct');
        if (mostViewProducts == undefined) {
            let results = [];
            Products.find({}, function(err, products) {
                var totalProduct = Math.floor(products.length / 3) * 3;
                for (let index = 0; index < totalProduct; index = index + 3) {
                    results.push({
                        one: products[index].toJSON(),
                        two: products[index + 1].toJSON(),
                        three: products[index + 2].toJSON(),
                    });
                }

                if (!err) {
                    reslove(results);
                    cache.set('mostViewProduct', results);
                } else {
                    reslove([]);
                }
            }).sort({ view: -1 }).limit(18);
        } else {
            reslove(mostViewProducts);
        }
    });
}

let getPostByCategory = function(urlSeo, pageSize, currentPage, sortBy, minPrice, maxPrice) {

    let sort = {};
    switch (sortBy) {
        case 0:
            sort = { created_date: -1 };
            break;
        case 1:
            sort = { urlSeo: 1 };
            break;
        case 2:
            sort = { urlSeo: -1 };
            break;
        case 3:
            sort = { price: 1 };
            break;
        case 4:
            sort = { price: -1 };
            break;
        case 5:
            sort = { rate: -1 };
            break;
        case 6:
            sort = { rate: 1 };
            break;
        case 7:
            sort = { code: -1 };
            break;
        case 8:
            sort = { code: 1 };
            break;
        default:
            sort = { created_date: -1 };
            break;
    }

    return new Promise(function(reslove, reject) {
        let skip = (currentPage - 1) * pageSize;
        let query = { $in: [urlSeo] };
        if (urlSeo == 'all') {
            query = { $ne: null };
        }
        Products.aggregate(
            [{
                    $match: {
                        "category": { $elemMatch: { urlSeo: query } },
                        "price": {
                            $gte: minPrice,
                            $lte: maxPrice
                        }
                    }
                },
                {
                    $project: {
                        detail: 0,
                        storage: 0,
                        blocksColor: 0,
                        blocksSize: 0,
                        created_date: 0,
                        updated_date: 0,
                        category: 0,
                        code: 0,
                        totalReview: 0,
                        quantity: 0,
                        point: 0,
                        rate: 0
                    }
                },

                {
                    $facet: {
                        edges: [
                            { $sort: sort },
                            { $skip: skip },
                            { $limit: pageSize }
                        ],
                        pageInfo: [
                            { $group: { _id: null, count: { $sum: 1 } } },
                        ],
                    },
                }
            ],
            function(err, data) {
                if (!err) {
                    reslove(data)
                } else {
                    console.log(err);
                }
            });
    });
}


router.get(process.env.CHECK_OUT, async function(req, res) {
    let general = await getGeneralConfig();
    let cart = await getCart(req.sessionID);
    let treeMenu = await getTreeMenu();
    res.render('client/check-out', {
        title: "Đặt hàng ngay",
        layout: 'client.hbs',
        general: general,
        cart: cart ? cart.toJSON() : null,
        currentUrl: process.env.R_BASE_IMAGE + req.url,
        treeMenu: treeMenu
    });
});

router.get(process.env.BLOG, async function(req, res) {
    const currentPage = req.params.page ? req.params.page : 1;
    let general = await getGeneralConfig();
    let cart = await getCart(req.sessionID);
    let posts = await getBlogsWithPagination(currentPage);
    let treeMenu = await getTreeMenu();
    res.render('client/blog', {
        title: general.title_home + " - Các bài viết",
        layout: 'client.hbs',
        general: general,
        cart: cart ? cart.toJSON() : null,
        posts: posts ? posts[0].edges : [],
        currentUrl: process.env.R_BASE_IMAGE + req.url,
        treeMenu: treeMenu,
        currentPage: currentPage
    });
});

let getBlogsWithPagination = function(page) {
    return new Promise(function(reslove, reject) {
        Posts.aggregate(
            [{
                $facet: {
                    edges: [
                        { $sort: { updated_date: -1 } },
                        { $skip: (page - 1) * 9 },
                        { $limit: 9 }
                    ],
                    pageInfo: [
                        { $group: { _id: null, count: { $sum: 1 } } },
                    ],
                },
            }],
            function(err, data) {
                if (!err) {
                    reslove(data)
                } else {
                    reject(null)
                }
            });
    });
}

router.get(process.env.CONTACT, async function(req, res) {
    let general = await getGeneralConfig();
    let cart = await getCart(req.sessionID);
    let treeMenu = await getTreeMenu();
    res.render('client/contact', {
        title: general.title_home + " - Liên hệ ngay ",
        layout: 'client.hbs',
        general: general,
        cart: cart ? cart.toJSON() : null,
        currentUrl: process.env.R_BASE_IMAGE + req.url,
        treeMenu: treeMenu
    });
});

router.get(process.env.CART, async function(req, res) {

    let general = await getGeneralConfig();
    let about_us = await getAboutUsInfo();
    let cart = await getCart(req.sessionID);
    let treeMenu = await getTreeMenu();
    res.render('client/cart', {
        title: general.title_home + " - Giỏ hàng",
        layout: 'client.hbs',
        general: general,
        about_us: about_us,
        imagePreview: process.env.R_BASE_IMAGE + '/img/about-us.jpg',
        cart: cart ? cart.toJSON() : null,
        currentUrl: process.env.R_BASE_IMAGE + req.url,
        treeMenu: treeMenu
    });
});

router.get(process.env.FAVOR_LIST, async function(req, res) {

    let general = await getGeneralConfig();
    let cart = await getCart(req.sessionID);
    let treeMenu = await getTreeMenu();
    res.render('client/favor-list', {
        title: general.title_home + " - Danh sách ưa thích ",
        layout: 'client.hbs',
        general: general,
        cart: cart ? cart.toJSON() : null,
        currentUrl: process.env.R_BASE_IMAGE + req.url,
        treeMenu: treeMenu
    });
});

router.get(`${process.env.POST}/:url`, async function(req, res) {
    const urlSeo = req.params.url;
    let treeMenu = await getTreeMenu();
    let cart = await getCart(req.sessionID);
    let general = await getGeneralConfig();
    let post = await getPostDetail(urlSeo);
    // console.log(post)
    let allCategory = await getAllCategory();
    console.log(allCategory);
    let recentPosts = await getPosts(4, 0);
    let nextPost = await findNextPost(post._id);
    let prevPost = await findPrevPost(post._id);
    res.render('client/post-detail', {
        title: general.title_home + ' - ' + post.title,
        layout: 'client.hbs',
        general: general,
        nextPost : nextPost,
        prevPost : prevPost,
        post: post ? post.toJSON() : null,
        cart: cart ? cart.toJSON() : null,
        treeMenu: treeMenu,
        recentPosts: recentPosts.map(post => post.toJSON()),
    });

});

let findNextPost = function(objectId) {
    return new Promise(function(reslove, reject) {
        Posts.findOne({  "_id": { $gt: objectId } }, { title: 1, urlSeo: 1 }, function(err, post) {
            if (!err && post) {
                reslove(post);
            } else {
                reslove(null);
            }
        }).sort({ crawler_date: 1 }).lean();
    });
}

let findPrevPost = function(objectId) {
    return new Promise(function(reslove, reject) {
        Posts.findOne({ "_id": { $lt: objectId } }, { title: 1, urlSeo: 1 }, function(err, post) {
            if (!err && post) {
                reslove(post);
            } else {
                reslove(null);
            }
        }).sort({ crawler_date: -1 }).lean();
    });
}

router.get(`${process.env.PRODUCT}/:url`, async function(req, res) {
    const urlSeo = req.params.url;
    let product = await getProductDetail(urlSeo);
    let reviews = await getReviews(product._id);
    let general = await getGeneralConfig();
    let productsRelated = await getRelatedProducts(product);
    let treeMenu = await getTreeMenu();
    let cart = await getCart(req.sessionID);
    if (product !== null) {
        res.render('client/product-detail', {
            title: general.title_home + ' - ' + product.name,
            layout: 'client.hbs',
            imagePreview: process.env.R_BASE_IMAGE + product.listImages[0],
            product: product.toJSON(),
            general: general,
            productsRelated: productsRelated,
            cart: cart ? cart.toJSON() : null,
            reviews: reviews.map(review => review.toJSON()),
            currentUrl: process.env.R_BASE_IMAGE + req.url,
            treeMenu: treeMenu
        });
    } else {
        // returrn 404
    }
});

let getPostDetail = function(urlSeo) {
    return new Promise(function(resolve, reject) {
        let post = cache.get('post' + urlSeo);
        if (post == undefined) {
            Posts.findOneAndUpdate({ urlSeo: urlSeo }, { $inc: { view: 1 } }, function(err, post) {
                if (!err) {

                    resolve(post)
                    cache.set('post' + urlSeo, post);
                } else {
                    resolve(null)
                }
            });
        } else {
            resolve(post)
        }
    });
}


let getCategoryDetail = function(urlCategory) {
    if (urlCategory == 'all') {
        return {
            name: 'Tất cả sản phẩm',
            note: ''
        }
    }
    return new Promise(function(reslove, reject) {
        let categoryDetail = cache.get('categoryDetail' + urlCategory);
        if (categoryDetail == undefined) {
            Categorys.findOne({ urlSeo: urlCategory }, function(err, category) {
                if (!err && category) {
                    cache.set('categoryDetail' + urlCategory, category.toJSON());
                    reslove(category.toJSON());
                }
            })
        } else {
            reslove(categoryDetail);
        }

    });
}

let getReviews = function(idProduct) {
    return new Promise(function(resolve, reject) {
        let reviews = cache.get('reviews' + idProduct);
        if (reviews == undefined) {
            Review.find({ productID: idProduct, public: true }, function(err, reviews) {
                if (!err) {
                    cache.set('reviews' + idProduct, reviews);
                    resolve(reviews);
                } else {
                    resolve([]);
                }
            })
        }
    });
}

let getCart = function(sessionID) {
    return new Promise(function(resolve, reject) {
        Carts.findOne({ sessionID: sessionID }, function(err, cart) {
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
            Products.aggregate([{ $match: { "category": { $elemMatch: { "urlSeo": { $in: listURLSeoRelated } } } } }], function(err, products) {
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

let getAllCategory = function() {
    return new Promise(function(reslove, reject) {
        let categorys = cache.get('allCategorys');
        if (categorys == undefined) {
            Categorys.find({}, { imageUrl: 0, isShow: 0, created_date: 0 }, function(err, categorys) {
                if (!err) {
                    cache.set('allCategorys', categorys);
                    reslove(categorys)
                }
            })
        } else {
            reslove(categorys)
        }
    });
}

let getTreeMenu = function() {
    return new Promise(function(reslove, reject) {
        let treeMenu = cache.get("treeMenu");
        if (treeMenu == undefined) {
            Categorys.aggregate([
                { $match: { parent: null } },
                {
                    $graphLookup: {
                        from: "categorys",
                        startWith: "$_id",
                        connectFromField: "_id",
                        connectToField: "parent",
                        as: "children"
                    }
                },
                { $sort: { name: 1 } }
            ], function(err, menuTree) {
                if (!err) {
                    //  console.log(menuTree);
                    cache.set("treeMenu", menuTree);
                    reslove(menuTree);
                } else {
                    reslove([]);
                }
            });
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
            Products.find({ type: 'new' }, { quantity: 0, totalOrder: 0, category: 0, note: 0, detail: 0, created_date: 0, updated_date: 0, view: 0, point: 0, __v: 0, totalReview: 0, rate: 0, code: 0 }, function(err, products) {
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
let getPosts = function(limit = 20, skip = 0) {
    return new Promise(function(resolve, reject) {
        let newPosts = cache.get("lastPosts");
        if (newPosts == undefined) {
            Posts.find({ isPublic: true }, function(err, posts) {
                if (!err) {
                    resolve(posts);
                    cache.set("lastPosts", posts);
                }
            }).limit(limit).skip(skip).sort({ updated_date: -1 });
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
            Products.find({ type: 'new' }, { quantity: 0, totalOrder: 0, category: 0, note: 0, detail: 0, created_date: 0, updated_date: 0, view: 0, point: 0, __v: 0, totalReview: 0, rate: 0, code: 0 }, function(err, products) {
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