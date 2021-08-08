const express = require('express');
const Settings = require('../models/settingModel');
const Products = require('../models/productModel');
const Posts = require('../models/postsModel');
const Banners = require('../models/config/bannerModel');
const Categorys = require('../models/categoryModel');
const CategorysPosts = require('../models/categoryPostModel');
const Carts = require('../models/cartModel');
const Review = require('../models/reviewModel');
const Comments = require('../models/commentModel');
const Instagram = require('../models/instagramModel');
let router = express.Router();
const NodeCache = require("node-cache");
const CategoryPost = require('../models/categoryPostModel');
const cache = new NodeCache({ stdTTL: process.env.CACHE_TIME });

router.post(process.env.SEARCH, async function(req, res) {

    if (req.body.search) {
        let keyword = xoa_dau(req.body.search.trim().toLowerCase());
        Products.find({ name_xoa_dau: { $regex: new RegExp(keyword, "i") } }, async function(err, products) {
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
                    cart: cart,
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
let xoa_dau = function(str) {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    return str;
}
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
        cart: cart,
        bestSellerProduct: bestSellerProduct.map(product => product.toJSON()),
        banners: banners.map(banner => banner.toJSON()),
        newPosts: newPosts.map(post => post.toJSON()),
        allCategory: allCategory.map(item => item.toJSON()),
        instagrams: instagrams.map(item => item.toJSON()),
        currentUrl: process.env.R_BASE_IMAGE,
        treeMenu: treeMenu
    });
});

router.get('/about-us', async function(req, res) {
    let general = await getGeneralConfig();
    let about_us = await getText('about_us');
    console.log(about_us);
    let cart = await getCart(req.sessionID);
    let treeMenu = await getTreeMenu();
    res.render('client/text', {
        title: general.title_home + ' - ' + "Về Momo",
        layout: 'client.hbs',
        titlePage: 'Về Momo',
        general: general,
        text: about_us,
        cart: cart,
        treeMenu: treeMenu
    });
});

router.get('/cooperate-policy', async function(req, res) {
    let general = await getGeneralConfig();
    let cooperate_policy = await getText('cooperate_policy');
    let cart = await getCart(req.sessionID);
    let treeMenu = await getTreeMenu();
    res.render('client/text', {
        title: general.title_home + ' - ' + "Chính Sách Hợp Tác",
        layout: 'client.hbs',
        titlePage: 'Chính Sách Hợp Tác',
        general: general,
        text: cooperate_policy,
        cart: cart,
        treeMenu: treeMenu
    });
});

router.get('/work-with-us', async function(req, res) {
    let general = await getGeneralConfig();
    let work_with_us = await getText('work_with_us');
    let cart = await getCart(req.sessionID);
    let treeMenu = await getTreeMenu();
    res.render('client/text', {
        title: general.title_home + ' - ' + "Work With Us",
        layout: 'client.hbs',
        titlePage: 'Work With Us',
        general: general,
        text: work_with_us,
        cart: cart,
        treeMenu: treeMenu
    });
});

router.get('/trung-tam-tro-giup', async function(req, res) {
    let general = await getGeneralConfig();
    let trung_tam_tro_giup = await getText('trung_tam_tro_giup');
    let cart = await getCart(req.sessionID);
    let treeMenu = await getTreeMenu();
    res.render('client/text', {
        title: general.title_home + ' - ' + "Trung Tâm Trợ Giúp",
        layout: 'client.hbs',
        titlePage: 'Trung Tâm Trợ Giúp',
        general: general,
        text: trung_tam_tro_giup,
        cart: cart,
        treeMenu: treeMenu
    });
});

router.get('/tuyen-dung', async function(req, res) {
    let general = await getGeneralConfig();
    let tuyen_dung = await getText('tuyen_dung');
    let cart = await getCart(req.sessionID);
    let treeMenu = await getTreeMenu();
    res.render('client/text', {
        title: general.title_home + ' - ' + "Tuyển Dụng",
        layout: 'client.hbs',
        titlePage: 'Tuyển Dụng',
        general: general,
        text: tuyen_dung,
        cart: cart,
        treeMenu: treeMenu
    });
});

router.get('/loyal-customer', async function(req, res) {
    let general = await getGeneralConfig();
    let loyal_customer = await getText('loyal_customer');
    let cart = await getCart(req.sessionID);
    let treeMenu = await getTreeMenu();
    res.render('client/text', {
        title: general.title_home + ' - ' + "Chương Trình Khách Hàng Thân Thiết",
        layout: 'client.hbs',
        titlePage: 'Chương Trình Khách Hàng Thân Thiết',
        general: general,
        text: loyal_customer,
        cart: cart,
        treeMenu: treeMenu
    });
});

router.get('/purchase-policy', async function(req, res) {
    let general = await getGeneralConfig();
    let purchase_policy = await getText('purchase_policy');
    let cart = await getCart(req.sessionID);
    let treeMenu = await getTreeMenu();
    res.render('client/text', {
        title: general.title_home + ' - ' + "Chính sách mua hàng",
        titlePage: 'Chính Sách Mua Hàng',
        layout: 'client.hbs',
        general: general,
        text: purchase_policy,
        cart: cart,
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
    // let allCategory = await getAllCategory();
    res.render('client/category-product', {
        title: general.title_home + ' - ' + categoryDetail.name,
        imagePreview: process.env.R_BASE_IMAGE + categoryDetail.imageUrl,
        layout: 'client.hbs',
        general: general,
        categoryDetail: categoryDetail,
        cart: cart,
        pageInfo: postsByCategory[0].pageInfo[0] || {count : 0},
        products: postsByCategory[0].edges,
        currentPage: currentPage,
        pageSize: pageSize,
        sortType: sortType,
        mostViewProducts: mostViewProducts,
        // allCategory: allCategory.map(item => item.toJSON()),
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
        cart: cart,
        currentUrl: process.env.R_BASE_IMAGE + req.url,
        treeMenu: treeMenu
    });
});

let getDetailCategoryPost = function(urlSeo) {
    return new Promise(function(reslove, reject) {
        CategoryPost.findOne({urlSeo : urlSeo}, function(err, detail) {
            if(!err) {
                reslove(detail)
            } else {
                reslove(null);
            }
        }).lean()
    })
}

router.get(`${process.env.BLOG}/:category_url`, async function(req, res) {


    const currentPage = req.query.page ? req.query.page : 1;
    const category_urlSeo =req.params.category_url.trim();
    const detailCategofy = await getDetailCategoryPost(category_urlSeo);
    console.log(detailCategofy);
    if(detailCategofy) {
        let general = await getGeneralConfig();
        let cart = await getCart(req.sessionID);
        let posts = await getBlogsWithPagination(currentPage,category_urlSeo);
        let treeMenu = await getTreeMenu();
        res.render('client/blog', {
            header : detailCategofy.name,
            title: general.title_home + "-" + detailCategofy.name,
            layout: 'client.hbs',
            general: general,
            cart: cart,
            posts: posts ? posts[0].edges : [],
            currentUrl: process.env.R_BASE_IMAGE + req.url,
            treeMenu: treeMenu,
            currentPage: currentPage
        });
    } else {
        res.redirect("/");
    }
 
});

router.get(process.env.BLOG, async function(req, res) {
    const currentPage = req.query.page ? req.query.page : 1;
    let general = await getGeneralConfig();
    let cart = await getCart(req.sessionID);
    let posts = await getBlogsWithPagination(currentPage);
    let treeMenu = await getTreeMenu();
    res.render('client/blog', {
        header : "DANH SÁCH TIN TỨC MỚI NHẤT CỦA MOMO",
        title: general.title_home + " - Các bài viết",
        layout: 'client.hbs',
        general: general,
        cart: cart,
        posts: posts ? posts[0].edges : [],
        currentUrl: process.env.R_BASE_IMAGE + req.url,
        treeMenu: treeMenu,
        currentPage: currentPage
    });
});

let getBlogsWithPagination = function(page , category_urlSeo = null) {

    let match = {};
    if(category_urlSeo) {
        match = {"category.urlSeo":category_urlSeo}
    }
    return new Promise(function(reslove, reject) {
        Posts.aggregate(
            [
                {
                    $match: match
                },
                {
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
        cart: cart,
        currentUrl: process.env.R_BASE_IMAGE + req.url,
        treeMenu: treeMenu
    });
});

router.get(process.env.CART, async function(req, res) {

    let general = await getGeneralConfig();
    let cart = await getCart(req.sessionID);
    let treeMenu = await getTreeMenu();
    res.render('client/cart', {
        title: general.title_home + " - Giỏ hàng",
        layout: 'client.hbs',
        general: general,
        imagePreview: process.env.R_BASE_IMAGE + '/img/about-us.jpg',
        cart: cart,
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
        cart: cart ,
        currentUrl: process.env.R_BASE_IMAGE + req.url,
        treeMenu: treeMenu
    });
});

let getCategoryPost = function() {

    return new Promise(function(reslove,reject) {
        CategorysPosts.find({}, function(err, data) {
          if(!err) {
            reslove(data)
          } else {
            reslove([]);
          }
        }).lean();
    });
}

let getComments = function(urlSeo) {
    return new Promise(function(reslove,reject) {
        Comments.find({urlSeo: urlSeo}, function(err,comments) {
            if(!err) {
                reslove(comments)
            } else{
                reslove([]);
            }
        }).lean().sort({created_date : -1});
    })
}
router.get(`${process.env.POST}/:url`, async function(req, res) {
    const urlSeo = req.params.url;
    let post = await getPostDetail(urlSeo);

    if(post && post._id) {
        let treeMenu = await getTreeMenu();
        let relatedPosts = await getRelatedPosts(post);
        let cart = await getCart(req.sessionID);
        let general = await getGeneralConfig();
        let allCategory = await getCategoryPost();
        let recentPosts = await getPosts(4, 0);
        let nextPost = await findNextPost(post._id);
        let prevPost = await findPrevPost(post._id);
        let comments = await getComments(urlSeo);
        res.render('client/post-detail', {
            title: general.title_home + ' - ' + post.title,
            layout: 'client.hbs',
            general: general,
            comments : comments,
            allCategory : allCategory,
            imagePreview: process.env.R_BASE_IMAGE + post.thumb_image,
            nextPost : nextPost,
            prevPost : prevPost,
            relatedPosts : relatedPosts,
            post: post,
            cart: cart,
            treeMenu: treeMenu,
            recentPosts: recentPosts.map(post => post.toJSON()),
        });
    } else {
        res.redirect('/');
    }
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
    if (product !== null) {
        let reviews = await getReviews(product._id);
        let general = await getGeneralConfig();
        let productsRelated = await getRelatedProducts(product);
        let treeMenu = await getTreeMenu();
        let cart = await getCart(req.sessionID);
        res.render('client/product-detail', {
            title: general.title_home + ' - ' + product.name,
            layout: 'client.hbs',
            imagePreview: process.env.R_BASE_IMAGE + product.listImages[0],
            product: product.toJSON(),
            general: general,
            productsRelated: productsRelated,
            cart: cart,
            reviews: reviews.map(review => review.toJSON()),
            currentUrl: process.env.R_BASE_IMAGE + req.url,
            treeMenu: treeMenu
        });
    } else {
        res.redirect('/')
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
            }).lean();
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
        }).lean();
    });

}

let getRelatedPosts = function(postItem) {
    const keyCache = 'related' + postItem._id;
    let listURLSeoRelated = [];
    postItem.category.forEach((item) => {
        listURLSeoRelated.push(item.urlSeo);
    });
    return new Promise(function(resolve, reject) {
        let posts = cache.get(keyCache);
        if (posts == undefined) {
            Posts.aggregate([{ $match: { "category": { $elemMatch: { "urlSeo": { $in: listURLSeoRelated } } } } }], function(err, posts) {
                if (!err) {
                    resolve(posts);
                    cache.set(keyCache, posts);
                } else {
                    resolve([]);
                }
            }).limit(3);
        } else {
            resolve(posts)
        }
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

let getText = function(type) {
    return new Promise(function(resolve, reject) {
        let data = cache.get(type);
        if (data == undefined) {
            Settings.findOne({ type: 'text' }, function(err, data) {
                if (!err) {
                    resolve(data.content[type]);
                    cache.set(type,data.content[type]);
                }
            });
        } else {
            resolve(data)
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
            });
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
            Products.find({ type: 'new' }, {  totalOrder: 0, category: 0, note: 0, detail: 0, created_date: 0, updated_date: 0, view: 0, point: 0, __v: 0, totalReview: 0, rate: 0}, function(err, products) {
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