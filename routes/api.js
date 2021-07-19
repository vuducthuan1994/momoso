const express = require('express');
let router = express.Router();
const Subscribe = require('../models/subscribeModel');
const Products = require('../models/productModel');
const Carts = require('../models/cartModel');
const Contacts = require('../models/contactModel');
const Reviews = require('../models/reviewModel');
const Orders = require('../models/orderModel');
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

router.post('/subscribe', commonLimiter, function (req, res) {
    Subscribe.create(req.body, function (err, data) {
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

router.post('/createOrder', function(req,res) {
    req.body['listProducts'] = JSON.parse(req.body['listProducts']);
    Orders.create(req.body, function (err, data) {
        if (!err) {
            res.json({
                success: true,
                data: data
            });
            Carts.updateOne({sessionID : req.sessionID}, {listCartProducts : []}, function(err, data) {
                if(!err) {
                    console.log("xóa cart thành công !")
                }
            })
            const mailOptions = {
                from: process.env.EMAIL_ACCOUNT, // sender address
                to: process.env.EMAIL_SHOP, // list of receivers
                subject: `MOMOSO - BẠN CÓ ĐƠN HÀNG MỚI`, // Subject line
                html: `<p>Vui lòng check hệ thống</p>` // plain text body
            };
            emailHelper.sendEmail(mailOptions);
        } else {
            res.json({
                success: false

            });
        }
    });

  
});

router.post('/createReview', reviewLimiter, function (req, res) {
    req.body['sessionID'] = req.sessionID;
    Reviews.create(req.body, function (err, data) {
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

router.post('/update_stock', function (req, res) {
    if(req.body.seller_sku && req.body.quantity_in_stock) {
        const seller_sku = req.body.seller_sku;
        const quantity_in_stock  = req.body.quantity_in_stock;
        Products.findOneAndUpdate({ "skus.sku": seller_sku },
        { "$set": { "skus.$.count" : quantity_in_stock } }, { new: true },
        function (err, new_product) {
            if (!err) {
                if(new_product && new_product.code && new_product.skus) {
                    let new_quantity = 0 ;
                    new_product.skus.forEach(obj => {
                        new_quantity = new_quantity + obj.count
                    });
                    Products.updateOne({code : new_product.code } , {quantity : new_quantity}, function(err,data) {
                        if(!err) {
                            console.log("update thành công tổng quantity sản phẩm");
                        }
                    });
                }
                res.json({
                    success: true,
                    msg : 'Cập nhật thành công !'
                })
            }
        }
    );
    } else {
        res.json({
            success: false,
            msg : 'Truyền thiếu tham số !'
        });
    }
})

router.post('/createMessage', reviewLimiter, function (req, res) {
    req.body['sessionID'] = req.sessionID;
    Contacts.create(req.body, function (err, data) {
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

router.post('/updateCart', commonLimiter, function (req, res) {
    Carts.findOneAndUpdate({ sessionID: req.sessionID }, { listCartProducts: req.body.listCartProducts }, function (err, data) {
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
})

router.post('/addToCart', commonLimiter, function (req, res) {
    const productId =  req.body.productId;
    if(productId && req.body.selection) {
        Products.findOne({ _id: productId }, function (err, product) {  
            if(!err && product) {
                copy_product =JSON.parse(JSON.stringify(product));
                let mergedProduct ={...copy_product , ...req.body.selection}
                Carts.findOneAndUpdate({ sessionID: req.sessionID, "listCartProducts._id": { $ne: productId } }, { $push: { "listCartProducts": mergedProduct } }, { upsert: true, new: true }, function (err, data) {
                    if (!err) {
                        res.json({
                            success: true,
                            msg: 'Cập nhật giỏ hàng thành công !',
                            product : mergedProduct,
                            lengthCart: data.listCartProducts.length
                        });
                    } else {
                        console.log(err);
                        res.json({
                            success: false,
                            msg: 'Không cập nhật được giỏ hàng !'
                        });
                    }
                });
    
            } else {
                res.json({
                    success: false,
                    msg: 'Sản phẩm không tồn tại !'
                });
            }
        });   
    } else{
        res.json({
            success: false,
            msg: 'Truyền thiếu tham số !'
        });
    }
   
});

router.post('/removeFromCart', commonLimiter, function (req, res) {
    Carts.findOneAndUpdate({ sessionID: req.sessionID }, { $pull: { "listCartProducts": { _id: req.body._id } } }, { new: true }, function (err, data) {
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

router.post('/addToWishList', commonLimiter, function (req, res) {
    const productId =  req.body.productId;
    Products.findOne({ _id: productId }, function (err, product) { 
        if(!err && product) {
            Carts.findOneAndUpdate({ sessionID: req.sessionID, "listFavorProducts._id": { $ne: productId} }, { $push: { "listFavorProducts": product } }, { upsert: true, new: true }, function (err, data) {
                if (!err) {
                    res.json({
                        success: true,
                        msg: 'thêm sản phẩm thành công vào danh sách ưa thích !',
                        lengthWishList: data.listFavorProducts.length
                    });
                } else {
                    res.json({
                        success: false,
                        msg: 'Không thêm được sản phẩm vào danh sách ưa thích!'
                    });
                }
            });

        } else {
            res.json({
                success: false,
                msg: 'Không thêm được sản phẩm vào danh sách ưa thích!'
            });
        }
    });
});


router.post('/removeFromWishList', commonLimiter, function (req, res) {
    Carts.findOneAndUpdate({ sessionID: req.sessionID }, { $pull: { "listFavorProducts": { _id: req.body._id } } }, { new: true }, function (err, data) {
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

router.get('/product/:id', function (req, res) {
    const idProduct = req.params.id;
    Products.findOne({ _id: idProduct }, function (err, product) {
        if (!err) {
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