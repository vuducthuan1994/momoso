var express = require('express');
var router = express.Router();
const sharp = require('sharp');
const Product = require('../../models/productModel');
const Category = require('../../models/categoryModel');
const Storage = require('../../models/storageModel');
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


//get all products
router.get('/', isAuthenticated, function(req, res) {
    Product.find({}, function(err, products) {
        if (!err) {
            res.render('admin/pages/product/index', {
                errors: req.flash('errors'),
                messages: req.flash('messages'),
                title: "Quản Lý Sản Phẩm",
                products: products.map(product => product.toJSON()),
                layout: 'admin.hbs'
            });
        }
    }).sort({ created_date: -1 });
});
router.get('/add-product', isAuthenticated, async function(req, res) {
    let categorys = await getCategory();
    let storages = await getStorage();
    res.render('admin/pages/product/add-product', {
        errors: req.flash('errors'),
        messages: req.flash('messages'),
        title: "Thêm Sản Phẩm",
        categorys: JSON.stringify(categorys),
        storages: JSON.stringify(storages),
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

let getStorage = function() {
    return new Promise(function(resolve, reject) {
        Storage.find({}, function(err, storages) {
            if (!err) {
                resolve(storages);
            }
        });
    });
}
const delay = ms => new Promise(res => setTimeout(res, ms));

router.get('/edit-product/:id', isAuthenticated, async function(req, res) {
    const productId = req.params.id;
    let categorys = await getCategory();
    let storages = await getStorage();
    Product.findOne({ _id: productId }, function(err, product) {
        if (err) {
            req.flash('messages', 'Lỗi hệ thống, không sửa được sản phẩm !')
            res.redirect('back');
        } else {
            res.render('admin/pages/product/add-product', {
                errors: req.flash('errors'),
                messages: req.flash('messages'),
                title: "Sửa Thông Tin Sản Phẩm",
                layout: 'admin.hbs',
                product: product.toJSON(),
                categorys: JSON.stringify(categorys),
                storages: JSON.stringify(storages),
                storageSelected: JSON.stringify(product.storage),
                categorySelected: JSON.stringify(product.category)
            });
        }
    })
});

let updateTotalProductInCategory = function(listCategory, type = 'increment') {
    let value = type == 'increment' ? 1 : -1;
    for (var i in listCategory) {
        Category.update({ urlSeo: listCategory[i].urlSeo }, { $inc: { totalProduct: value } }, function(err, data) {
            if (err) {
                console.log(err);
            }
        });
    }
}

let resizeImages = function(oldPath, newPath) {
        sharp(oldPath)
            .resize(600, 756, {
                fit: "cover"
            }).toFile(newPath, function(err) {

            });
    }
    // create product
router.post('/', isAuthenticated, async function(req, res) {
    let newListImage = [];
    let content = {};
    let blocksColor = [];
    let blocksSize = [];
    const form = formidable({ multiples: true });

    var dir = __basedir + '/public/img/product';
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, 0744);
    }

    form.parse(req);
    form.on('field', function(fieldName, fieldValue) {
        if (fieldName !== 'files[]' && fieldName !== 'newcolorsName' && fieldName !== 'newcolorsCode' && fieldName !== 'blocksSize') {
            content[fieldName] = fieldValue;
        }
        if (fieldName == 'category' || fieldName == 'storage' || fieldName == 'blocksSize') {
            content[fieldName] = JSON.parse(fieldValue);
            if (fieldName == 'category') {
                updateTotalProductInCategory(JSON.parse(fieldValue));
            }
        }
        if (fieldName == 'newcolorsName') {
            JSON.parse(fieldValue).forEach((colorName, index) => {
                if (blocksColor[index] == undefined) {
                    blocksColor[index] = {
                        listImages: [],
                        colorName: colorName,
                        colorCode: null
                    }
                } else {
                    blocksColor[index].colorName = colorName;
                }
            });
        }
        if (fieldName == 'newcolorsCode') {
            JSON.parse(fieldValue).forEach((colorCode, index) => {
                if (blocksColor[index] == undefined) {
                    blocksColor[index] = {
                        listImages: [],
                        colorName: null,
                        colorCode: colorCode
                    }
                } else {
                    blocksColor[index].colorCode = colorCode;
                }
            });
        }
    });

    form.on('file', async function(fieldName, file) {
        if (fieldName == 'files[]' && file.name !== '') {

            const imgName = uslug((new Date().getTime() + '-' + file.name), { allowedChars: '.', lower: true });
            const new_path = path.join(__basedir, `public/img/product/${imgName}`);

            newListImage.push(`/img/product/${imgName}`);
            resizeImages(file.path, new_path);
        }
        if (file.name !== '' && fieldName.includes('color_image_block_')) {
            const imgName = uslug((new Date().getTime() + '-' + file.name), { allowedChars: '.', lower: true });
            const new_path = path.join(__basedir, `public/img/product/${imgName}`);

            const indexColor = parseInt(fieldName.slice(fieldName.length - 1));
            if (blocksColor[indexColor] == undefined) {
                blocksColor[indexColor] = {
                    listImages: [],
                    colorName: null
                }
                blocksColor[indexColor].listImages.push(`/img/product/${imgName}`);
            } else {
                blocksColor[indexColor].listImages.push(`/img/product/${imgName}`);
            }
            resizeImages(file.path, new_path);
        }
    });
    form.on('end', async function() {
        content['listImages'] = newListImage;
        content['blocksColor'] = blocksColor;
        Product.create(content, function(err, product) {
            if (!err) {
                res.json({
                    success: true,
                    msg: 'Sản phẩm đã được thêm vào hệ thống !',
                    data: product
                });
            } else {
                let msg = null;
                if (err.code = 11000) {
                    msg = err.errmsg;
                } else {}
                res.json({
                    success: false,
                    msg: msg,
                    data: product
                });
            }
        });
    });
});

router.post('/deleteImage', function(req, res) {
    const form = formidable({ multiples: true });
    form.parse(req);
    form.on('field', function(fieldName, fieldValue) {
        if (fieldName == 'url') {
            const filePath = 'public' + fieldValue;
            fs.unlink(filePath, function(err) {
                if (!err) {
                    res.json({
                        success: true,
                        msg: 'Ảnh đã xóa khỏi hệ thống !'
                    });
                } else {
                    res.json({
                        success: false,
                        msg: 'Không xóa được ảnh khỏi hệ thống !'
                    });
                }
            });
        }
    });

});

//edit product
router.post('/edit-product/:id', async function(req, res) {

    const idProduct = req.params.id;
    let newListImage = [];
    let oldColorBlock = [];
    let blocksColor = []
    let content = {};
    const form = formidable({ multiples: true });

    form.parse(req);
    form.on('field', function(fieldName, fieldValue) {
        if (fieldName !== 'files[]' && fieldName !== 'oldColorBlock' && fieldName !== 'commonImages' && fieldName !== 'newcolorsName' && fieldName !== 'newcolorsCode' && fieldName !== 'blocksSize') {
            content[fieldName] = fieldValue;
        }
        if (fieldName == 'category' || fieldName == 'storage' || fieldName == 'blocksSize') {
            content[fieldName] = JSON.parse(fieldValue);
            if (fieldName == 'category') {
                updateTotalProductInCategory(JSON.parse(fieldValue));
            }
        }
        if (fieldName == 'commonImages') {
            newListImage = newListImage.concat(JSON.parse(fieldValue));
        }
        if (fieldName == 'oldColorBlocks') {
            oldColorBlock = JSON.parse(fieldValue);
        }
        if (fieldName == 'newcolorsName') {
            JSON.parse(fieldValue).forEach((colorName, index) => {
                if (blocksColor[index] == undefined) {
                    blocksColor[index] = {
                        listImages: [],
                        colorName: colorName
                    }
                } else {
                    blocksColor[index].colorName = colorName;
                }
            });
        }
        if (fieldName == 'newcolorsName') {
            JSON.parse(fieldValue).forEach((colorName, index) => {
                if (blocksColor[index] == undefined) {
                    blocksColor[index] = {
                        listImages: [],
                        colorName: colorName,
                        colorCode: null
                    }
                } else {
                    blocksColor[index].colorName = colorName;
                }
            });
        }
        if (fieldName == 'newcolorsCode') {
            JSON.parse(fieldValue).forEach((colorCode, index) => {
                if (blocksColor[index] == undefined) {
                    blocksColor[index] = {
                        listImages: [],
                        colorName: null,
                        colorCode: colorCode
                    }
                } else {
                    blocksColor[index].colorCode = colorCode;
                }
            });
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
            newListImage.push(`/img/product/${imgName}`);
            resizeImages(file.path, new_path);
        }

        if (file.name !== '' && fieldName.includes('color_image_block_')) {
            const imgName = uslug((new Date().getTime() + '-' + file.name), { allowedChars: '.', lower: true });
            const new_path = path.join(__basedir, `public/img/product/${imgName}`);

            const indexColor = parseInt(fieldName.slice(fieldName.length - 1));
            if (blocksColor[indexColor] == undefined) {
                blocksColor[indexColor] = {
                    listImages: [],
                    colorName: null
                }
                blocksColor[indexColor].listImages.push(`/img/product/${imgName}`);
            } else {
                blocksColor[indexColor].listImages.push(`/img/product/${imgName}`);
            }
            resizeImages(file.path, new_path);
        }
    });
    form.on('end', async function() {
        content['listImages'] = newListImage;
        content['blocksColor'] = oldColorBlock.concat(blocksColor);
        Product.findOneAndUpdate({ _id: idProduct }, content, function(err, product) {
            updateTotalProductInCategory(product.category, 'decrement');
            if (!err) {
                req.res.json({
                    success: true,
                    data: product
                });
            } else {
                let msg = null;
                if (err.code = 11000) {
                    msg = err.errmsg;
                } else {}
                res.json({
                    success: false,
                    msg: msg,
                    data: product
                });
            }
        });
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