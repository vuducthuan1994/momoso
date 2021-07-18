const { createSitemapsAndIndex } = require('sitemap')
const Products = require('../models/productModel');
const Posts = require('../models/postsModel');
const CategorysProducts = require('../models/categoryModel');

var path = require('path');
require('dotenv').config()


class SiteMapService {
    constructor() { }
    createSiteMap() {
        createSiteMap()
    }
}

let getCategorysProducts = function() {
    return new Promise(function (reslove, reject) {
        CategorysProducts.find({}, function (err, products) {
            if (!err) {
                reslove(products)
            } else {
                reslove([])
            }
        })
    });
}

let getPosts =  function() {
    return new Promise(function (reslove, reject) {
        Posts.find({}, function (err, posts) {
            if (!err) {
                reslove(posts)
            } else {
                reslove([])
            }
        })
    });
}

let getProducts = function () {
    return new Promise(function (reslove, reject) {
        Products.find({}, function (err, products) {
            if (!err) {
                reslove(products)
            } else {
                reslove([])
            }
        })
    });
}

let createSiteMap = async function () {
    let urls = [];
    let itemUrlHome = { url: `/`, priority: 1, lastmod: new Date() }
    urls.push(itemUrlHome);

    let categoryProducts = await getCategorysProducts();
    for (let _idx = 0; _idx < categoryProducts.length; _idx++) {
        const categoryInfo = categoryProducts[_idx];
        let itemUrl = { url: `${process.env.CATEGORY_PRODUCT}/${categoryInfo.urlSeo}/`, priority: 1, lastmod: new Date() }
        urls.push(itemUrl);
    }

    let products = await getProducts();
    for (let _idx = 0; _idx < products.length; _idx++) {
        const productInfo = products[_idx];
        let itemUrl = { url: `${process.env.PRODUCT}/${productInfo.urlSeo}/`, priority: 1, lastmod: new Date() }
        urls.push(itemUrl);
    }

    let itemUrlAboutUs = { url: `${process.env.ABOUT_US}/`, priority: 0.7, lastmod: new Date() }
    urls.push(itemUrlAboutUs);

    let itemUrlBlog= { url: `${process.env.BLOG}/`, priority: 0.7, lastmod: new Date() }
    urls.push(itemUrlBlog);

    let itemUrlContact= { url: `${process.env.CONTACT}/`, priority: 0.5, lastmod: new Date() }
    urls.push(itemUrlContact);

    let itemUrlPurchasePolicy= { url: `${process.env.PURCHASE_POLICY}/`, priority: 0.5, lastmod: new Date() }
    urls.push(itemUrlPurchasePolicy);

    let posts = await getPosts();
    for (let _idx = 0; _idx < posts.length; _idx++) {
        const postInfo = posts[_idx];
        let itemUrl = { url: `${process.env.POST}/${postInfo.urlSeo}/`, priority: 0.5, lastmod: new Date() }
        urls.push(itemUrl);
    }


    createSitemapsAndIndex({
        urls: urls,
        targetFolder: path.join(__basedir, 'public'),
        hostname: process.env.R_DOMAIN,
        cacheTime: 600,
        sitemapName: 'sitemap',
        sitemapSize: 5000, // number of urls to allow in each sitemap
        gzip: false, // whether to gzip the files
    });
}

module.exports = SiteMapService;