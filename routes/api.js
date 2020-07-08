const express = require('express');
let router = express.Router();
const Subscribe = require('../models/subscribeModel');
const Products = require('../models/productModel');
const Carts = require('../models/cartModel');
const Contacts = require('../models/contactModel');
const Reviews = require('../models/reviewModel');
const rateLimit = require("express-rate-limit");
const reviewLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minutes
    max: 5 // limit each IP to 100 requests per windowMs
});

const commonLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hours
    max: 200 // limit each IP to 100 requests per windowMs
});
require('dotenv').config();
const EmailService = require('../service/email_service');
const emailHelper = new EmailService();

router.post('/subscribe', commonLimiter, function(req, res) {
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
    req.body['sessionID'] = req.sessionID;
    Reviews.create(req.body, function(err, data) {
        if (!err) {
            res.json({
                success: true,
                data: data
            });
            const mailOptions = {
                from: process.env.EMAIL_ACCOUNT, // sender address
                to: process.env.EMAIL_SHOP, // list of receivers
                subject: `MOMOSO - BẠN CÓ BÌNH LUẬN MỚI TỪ KHÁCH HÀNG ${data.name}`, // Subject line
                html: `<h5>URL SẢN PHẨM: ${data.URL}</h5>   <h5>Sản phẩm nhận bình luận: ${data.productName}</h5> <br>  <p> <strong>Nội dung  bình luận:</strong> ${data.comment} </p> <br> <p><i>Vui lòng đăng nhập hệ thống MoMo để biết thêm chi tiết !</i></p>` // plain text body
            };
            emailHelper.sendEmail(mailOptions);
        } else {
            console.log(err);
            res.json({
                success: false

            });
        }
    });
});

router.post('/createMessage', reviewLimiter, function(req, res) {
    req.body['sessionID'] = req.sessionID;
    Contacts.create(req.body, function(err, data) {
        if (!err) {
            res.json({
                success: true,
                data: data
            });
            const mailOptions = {
                from: process.env.EMAIL_ACCOUNT, // sender address
                to: process.env.EMAIL_SHOP, // list of receivers
                subject: `MOMOSO - BẠN CÓ LỜI NHẮN TỪ KHÁCH HÀNG ${data.name}`, // Subject line
                html: `<h5>${data.subject}</h5> <br>  <p> <strong>Nội dung lời nhắn:</strong> ${data.message} </p> <br> <p><i>Vui lòng đăng nhập hệ thống MoMo để biết thêm chi tiết !</i></p>` // plain text body
            };
            emailHelper.sendEmail(mailOptions);

        } else {
            console.log(err);
            res.json({
                success: false
            });
        }
    });
});

router.post('/addToCart', commonLimiter, function(req, res) {
    Carts.findOneAndUpdate({ sessionID: req.sessionID, "listCartProducts._id": { $ne: req.body.product._id } }, { $push: { "listCartProducts": req.body.product } }, { upsert: true, new: true }, function(err, data) {
        if (!err) {
            res.json({
                success: true,
                msg: 'Cập nhật giỏ hàng thành công !',
                lengthCart: data.listCartProducts.length
            });
        } else {
            res.json({
                success: false,
                msg: 'Không cập nhật được giỏ hàng !'
            });
        }
    });
});

router.post('/removeFromCart', commonLimiter, function(req, res) {
    console.log(req.body);
    Carts.findOneAndUpdate({ sessionID: req.sessionID }, { $pull: { "listCartProducts": { _id: req.body._id } } }, { new: true }, function(err, data) {
        if (!err) {
            res.json({
                success: true,
                msg: 'Xóa sản phẩm khỏi giỏ hàng thành công',
                lengthCart: data ? data.listCartProducts.length : 0
            });
        } else {
            res.json({
                success: false,
                msg: 'Không cập nhật được giỏ hàng !'
            });
        }
    });
});

router.post('/addToWishList', commonLimiter, function(req, res) {
    Carts.findOneAndUpdate({ sessionID: req.sessionID, "listFavorProducts._id": { $ne: req.body.product._id } }, { $push: { "listFavorProducts": req.body.product } }, { upsert: true, new: true }, function(err, data) {
        if (!err) {
            res.json({
                success: true,
                msg: 'thêm sản phẩm thành công vào danh sách ưa thích !',
                lengthWishList: data.listFavorProducts.length
            });
        } else {
            console.log(err);
            res.json({
                success: false,
                msg: 'Không thêm được sản phẩm vào danh sách ưa thích!'
            });
        }
    });
});


router.post('/removeFromWishList', commonLimiter, function(req, res) {
    Carts.findOneAndUpdate({ sessionID: req.sessionID }, { $pull: { "listFavorProducts": { _id: req.body._id } } }, { new: true }, function(err, data) {
        if (!err) {
            res.json({
                success: true,
                msg: 'Xóa thành công!',
                lengthWishList: data.listFavorProducts.length
            });
        } else {
            console.log(err);
            res.json({
                success: false,
                msg: 'Không xóa được sản phẩm khỏi danh sách ưa thích !'
            });
        }
    });
});

router.get('/product/:id', function(req, res) {
    const idProduct = req.params.id;
    Products.findOne({ _id: idProduct }, { view: 0, category: 0, note: 0, detail: 0, created_date: 0, updated_date: 0, type: 0 }, function(err, product) {
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