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


var slugFromTitle = function(str) {

    // Chuyển hết sang chữ thường
    str = str.toLowerCase();

    // xóa dấu
    str = str.replace(/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/g, 'a');
    str = str.replace(/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/g, 'e');
    str = str.replace(/(ì|í|ị|ỉ|ĩ)/g, 'i');
    str = str.replace(/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/g, 'o');
    str = str.replace(/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/g, 'u');
    str = str.replace(/(ỳ|ý|ỵ|ỷ|ỹ)/g, 'y');
    str = str.replace(/(đ)/g, 'd');

    // Xóa ký tự đặc biệt
    str = str.replace(/([^0-9a-z-\s])/g, '');

    // Xóa khoảng trắng thay bằng ký tự -
    str = str.replace(/(\s+)/g, '-');

    // xóa phần dự - ở đầu
    str = str.replace(/^-+/g, '');

    // xóa phần dư - ở cuối
    str = str.replace(/-+$/g, '');

    // return
    return str;
};
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
    }).sort({ updated_date: -1 });
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

let resizeImages = function(oldPath, newPath, type = 'default') {
        let width = 600;
        let height = 756;

        if (type == 'thumb_cart') {
            width = 70;
            height = 95;
        }
        sharp(oldPath)
            .resize(width, height, {
                fit: "cover"
            }).toFile(newPath, function(err) {

            });
    }
    // create product
router.post('/', isAuthenticated, async function(req, res) {
    let listCommonImage = [];
    let listColorImage = [];
    let content = {};
    let blocksColor = [];
    const form = formidable({ multiples: true });

    var dir = __basedir + '/public/img/product';
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, 0744);
    }

    form.parse(req);
    form.on('field', function(fieldName, fieldValue) {
        if (fieldName !== 'commonImageFile' && fieldName !== 'colorBlocks' && fieldName !== 'blocksSize') {
            content[fieldName] = fieldValue;
        }
        if (fieldName == 'category' || fieldName == 'storage' || fieldName == 'blocksSize') {
            content[fieldName] = JSON.parse(fieldValue);
        }

        if (fieldName == 'colorBlocks') {
            blocksColor = JSON.parse(fieldValue);
        }
    });

    form.on('file', async function(fieldName, file) {
        if (fieldName == 'commonImageFile' && file.name !== '') {
            const imgName = uslug((new Date().getTime() + '-' + (content['name'] ? (slugFromTitle(content['name']) + '.jpg') : file.name)), { allowedChars: '.-', lower: true });
            const new_path = path.join(__basedir, `public/img/product/${imgName}`);

            listCommonImage.push(`/img/product/${imgName}`);
            resizeImages(file.path, new_path);

            if (content['thumb_cart'] == undefined) {
                const thumb_cart_path = path.join(__basedir, `public/img/product/thumb_cart_${imgName}`)
                content['thumb_cart'] = `/img/product/thumb_cart_${imgName}`;
                resizeImages(file.path, thumb_cart_path, type = 'thumb_cart');
            }

        }
        if (file.name !== '' && fieldName.includes('color_image_block_')) {
            const imgName = uslug((new Date().getTime() + '-' + (content['name'] ? (slugFromTitle(content['name']) + '.jpg') : file.name)), { allowedChars: '.-', lower: true });
            const new_path = path.join(__basedir, `public/img/product/${imgName}`);
            
            // get index color
            const indexColor = parseInt(fieldName.slice(fieldName.length - 1));
            // end get indexcolor
            listColorImage[indexColor] = `/img/product/${imgName}`;
            resizeImages(file.path, new_path);
        }
    });
    form.on('end', async function() {
        content['listImages'] = listCommonImage;
        blocksColor.forEach(function(value, index) {
            blocksColor[index].listImages.push(listColorImage[index]);
        });

        content['blocksColor'] = blocksColor;
    
        let skus = getSkus(content.code,content.blocksColor,content.blocksSize,content.list_price);
        content['skus'] = skus;
        Product.create(content, function(err, product) {
            if (!err) {
                updateTotalProductInCategory(product.category);

                res.json({
                    success: true,
                    msg: 'Sản phẩm đã được thêm vào hệ thống !',
                    data: product
                });
            } else {
                let msg = null;
                if (err.code = 11000) {
                    msg = err.errmsg;
                } else {
                    msg = JSON.stringify(err);
                }
                res.json({
                    success: false,
                    msg: msg,
                    data: JSON.stringify(err)
                });
            }
        });
    });
});

let getSkus = function (productCode, colors, sizes, prices) {
    let result = [];
 
    let listPrices = prices.split(";");
    for (let i = 0; i < colors.length; i++) {
        const color = colors[i].colorCode;
        for (let j = 0; j < sizes.length; j++) {
            const size = sizes[j].sizeCode;
            result.push({
                sku: `${productCode}${color}${size}`,
                count: 1,
                price: Number(listPrices[j])
            })
        }
    }
    return result;
}


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
    let listCommonImage = [];
    let blocksColor = []
    let content = {};
    const form = formidable({ multiples: true });

    let newCategorys = [];

    form.parse(req);
    form.on('field', function(fieldName, fieldValue) {
        if (fieldName !== 'commonImageFile' && fieldName !== 'colorBlocks' && fieldName !== 'commonImages' && fieldName !== 'blocksSize') {
            content[fieldName] = fieldValue;
        }
        if (fieldName == 'category' || fieldName == 'storage' || fieldName == 'blocksSize') {
            content[fieldName] = JSON.parse(fieldValue);
            if (fieldName == 'category') {
                newCategorys = JSON.parse(fieldValue);
            }
        }
        if (fieldName == 'commonImages') {
            listCommonImage = listCommonImage.concat(JSON.parse(fieldValue));
        }
        if (fieldName == 'colorBlocks') {
            blocksColor = JSON.parse(fieldValue);
        }
    });

    form.on('file', async function(fieldName, file) {
        if (fieldName == 'commonImageFile' && file.name !== '') {
            const imgName = uslug((new Date().getTime() + '-' + (content['name'] ? (slugFromTitle(content['name']) + '.jpg') : file.name)), { allowedChars: '.-', lower: true });
            var dir = __basedir + '/public/img/product';
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, 0744);
            }
            const new_path = path.join(__basedir, `public/img/product/${imgName}`);
            listCommonImage.push(`/img/product/${imgName}`);
            resizeImages(file.path, new_path);

            if (content['thumb_cart'] == undefined) {
                const thumb_cart_path = path.join(__basedir, `public/img/product/thumb_cart_${imgName}`)
                content['thumb_cart'] = `/img/product/thumb_cart_${imgName}`;
                resizeImages(file.path, thumb_cart_path, type = 'thumb_cart');
            }
        }

        if (file.name !== '' && fieldName.includes('color_image_block_')) {
            const imgName = uslug((new Date().getTime() + '-' + (content['name'] ? (slugFromTitle(content['name']) + '.jpg') : file.name)), { allowedChars: '.-', lower: true });
            const new_path = path.join(__basedir, `public/img/product/${imgName}`);
            const indexColor = parseInt(fieldName.slice(fieldName.length - 1));

            if (blocksColor[indexColor] == undefined) {
                blocksColor[indexColor] = {
                    listImages: [],
                    colorName: null,
                    colorCode: null
                }
                blocksColor[indexColor].listImages.push(`/img/product/${imgName}`);
            } else {
                blocksColor[indexColor].listImages = [];
                blocksColor[indexColor].listImages.push(`/img/product/${imgName}`);
            }
            resizeImages(file.path, new_path);
        }
    });
    form.on('end', async function() {
        content['listImages'] = listCommonImage;
        content['updated_date'] = new Date();
        content['blocksColor'] = blocksColor;
        Product.findOneAndUpdate({ _id: idProduct }, content, function(err, product) {
            updateTotalProductInCategory(newCategorys);
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
                } else {
                    msg = JSON.stringify(err);
                }
                res.json({
                    success: false,
                    msg: msg,
                    data: JSON.stringify(err)
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
    }, function(err, product) {
        if (!err) {
            updateTotalProductInCategory(product.category, 'decrement');
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

module.exports = router;;