var express = require('express');
var router = express.Router();
const sharp = require('sharp');
const Product = require('../../models/productModel');
const Category = require('../../models/categoryModel');
var path = require('path');
const fs = require('fs');
const formidable = require('formidable');
var uslug = require('uslug');

var isAuthenticated = function(req, res, next) {
    if (process.env.ENV == 'DEV') {
        return next();
    }
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}


//get all posts
router.get('/', isAuthenticated, function(req, res) {
    Product.find({}, function(err, categorys) {
        if (!err) {
            res.render('admin/pages/category/index', {
                errors: req.flash('errors'),
                messages: req.flash('messages'),
                title: "Quản Lý Loại SP",
                categorys: categorys.map(category => category.toJSON()),
                layout: 'admin.hbs'
            });
        }
    });
});
router.get('/add-product', isAuthenticated, async function(req, res) {

    let categorys = await getCategory();
    res.render('admin/pages/product/add-product', {
        errors: req.flash('errors'),
        messages: req.flash('messages'),
        title: "Thêm Loại SP",
        categorys: categorys.map(category => category.toJSON()),
        layout: 'admin.hbs'
    });
});
let getCategory = function() {
    return new Promise(function(resolve, reject) {
        Category.find({}, function(err, categorys) {
            if (!err) {
                resolve(categorys);
            }
        });
    });
}
const delay = ms => new Promise(res => setTimeout(res, ms));
router.get('/edit-category/:id', isAuthenticated, function(req, res) {
    const categoryID = req.params.id;
    Product.findOne({ _id: categoryID }, function(err, storage) {
        if (err) {
            req.flash('messages', 'Lỗi hệ thống, không sửa được Loại SP !')
            res.redirect('back');
        } else {
            res.render('admin/pages/storage/add-storage', {
                errors: req.flash('errors'),
                messages: req.flash('messages'),
                title: "Sửa Thông Tin Kho Hàng",
                layout: 'admin.hbs',
                storage: storage.toJSON()
            });
        }
    })
});


let resizeImages = function(oldPath, newPath) {
        return new Promise(function(resolve, reject) {
            sharp(oldPath)
                .resize(600, 756, {
                    fit: "cover"
                }).toFile(newPath, function(err) {
                    if (!err) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                });
        });
    }
    // create product
router.post('/', isAuthenticated, async function(req, res) {
    // let resizeWidth = 370;
    let newListImage = [];
    let content = {};
    formidable
    const form = formidable({ multiples: true });
    form.parse(req);

    form.on('field', function(fieldName, fieldValue) {
        if (fieldName !== 'files[]') {
            content[fieldName] = fieldValue;
        }
        if (fieldName == 'category') {
            content[fieldName] = JSON.parse(fieldValue);
        }
    });

    form.on('file', async function(fieldName, file) {
        if (fieldName == 'files[]' && file.name !== '') {
            const imgName = uslug((new Date().getTime() + '-' + file.name), { allowedChars: '.', lower: true });

            var dir = __basedir + '/public/img/product';
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, 0744);
            }
            const new_path = path.join(__basedir, `public/img/product/${imgName}`);

            let resizeImage = await resizeImages(file.path, new_path);

            if (resizeImage) {
                req.flash('messages', 'Ảnh đã được resize đúng kích cỡ !');
                newListImage.push(`/img/product/${imgName}`);
            }
        }
    });
    form.on('end', async function() {
        await delay(2000);
        content['listImages'] = newListImage;
        Product.create(content, function(err, data) {
            console.log(err)
            if (!err) {
                res.json({
                    success: true,
                    msg: 'Sản phẩm đã được thêm vào hệ thống !',
                    data: data
                });
            } else {
                let msg = null;
                if (err.code = 11000) {
                    msg = err._message;
                } else {}
                res.json({
                    success: false,
                    msg: msg,
                    data: data
                });
            }
        });

    })



});

//edit product
router.post('/edit-product/:id', async function(req, res) {
    let resizeWidth = 370;
    let content = {};
    const form = formidable({ multiples: true });
    form.parse(req);

    form.on('field', function(fieldName, fieldValue) {
        content[fieldName] = fieldValue;
        if (fieldName == 'typeImage') {
            if (fieldValue !== 'small') {
                resizeWidth = 700;
            }
        }

    });
    await new Promise(function(resolve, reject) {
        form.on('file', function(fieldName, file) {
            if (fieldName == 'imageUrl' && file.name !== '') {
                const imgName = uslug((new Date().getTime() + '-' + file.name), { allowedChars: '.', lower: true });
                var dir = __basedir + '/public/img/category';
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, 0744);
                }
                const img_path = path.join(__basedir, `public/img/category/${imgName}`);

                sharp(file.path)
                    .resize(resizeWidth, 400, {
                        fit: "cover"
                    }).webp({ quality: 100 })
                    .toFile(img_path, function(err) {
                        if (!err) {
                            content['imageUrl'] = `/img/category/${imgName}`;
                            resolve();
                        } else {
                            reject();
                        }
                    });
            }
        });
    });
    const idBanner = req.params.id;
    content['updated_date'] = new Date();
    Product.updateOne({ _id: idBanner }, content, function(err, data) {
        if (!err) {
            req.flash('messages', 'Sửa kho hàng thành công !');
            res.redirect('back');
        } else {
            req.flash('errors', 'Không sửa được Kho hàng');
            res.redirect('back');
        }
    });
});

router.get('/delete/:id', isAuthenticated, function(req, res) {
    const id = req.params.id;
    const messages = [];
    Product.findOneAndDelete({
        _id: id,
    }, function(err, storage) {
        if (!err) {
            messages.push('Xóa sản phẩm công !')
            req.flash('messages', messages)
            res.redirect('back');
        } else {
            messages.push('Xóa sản phẩm thất bại ')
            req.flash('messages', messages)
            res.redirect('back');
        }
    });
});

module.exports = router;