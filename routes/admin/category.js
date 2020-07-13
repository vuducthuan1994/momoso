var express = require('express');
var router = express.Router();
const sharp = require('sharp');
const Category = require('../../models/categoryModel');
var path = require('path');
const fs = require('fs');
const formidable = require('formidable');
var uslug = require('uslug');
const Product = require('../../models/productModel');
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

let getAllCategory = function() {
    return new Promise(function(reslove, reject) {

        Category.find({}, function(err, categorys) {
            if (!err) {

                reslove(categorys)
            }
        })

    });
}


//get all posts
router.get('/', isAuthenticated, function(req, res) {
    Category.find({}, function(err, categorys) {
        if (!err) {
            res.render('admin/pages/category/index', {
                errors: req.flash('errors'),
                messages: req.flash('messages'),
                title: "Quản Lý Loại SP",
                categorys: categorys.map(category => category.toJSON()),
                layout: 'admin.hbs'
            });
        }
    }).sort({ updated_date: -1 });
});
router.get('/add-category', isAuthenticated, async function(req, res) {
    let allCategory = await getAllCategory();
    res.render('admin/pages/category/add-category', {
        errors: req.flash('errors'),
        messages: req.flash('messages'),
        title: "Thêm Loại SP",
        layout: 'admin.hbs',
        allCategory: allCategory.map(item => item.toJSON())
    });
});

router.get('/edit-category/:id', isAuthenticated, async function(req, res) {
    let allCategory = await getAllCategory();
    const categoryID = req.params.id;
    Category.findOne({ _id: categoryID }, function(err, category) {
        if (err) {
            req.flash('messages', 'Lỗi hệ thống, không sửa được Loại SP !')
            res.redirect('back');
        } else {
            res.render('admin/pages/category/add-category', {
                errors: req.flash('errors'),
                messages: req.flash('messages'),
                title: "Sửa Thông Tin Kho Hàng",
                layout: 'admin.hbs',
                category: category ? category.toJSON() : null,
                allCategory: allCategory.map(item => item.toJSON())
            });
        }
    })
});

let resizeImages = function(width, oldPath, newPath) {
        sharp(oldPath)
            .resize(width, 400, {
                fit: "cover"
            }).toFile(newPath, function(err) {

            });
    }
    // create category
router.post('/', async function(req, res) {
    let resizeWidth = 370;
    let content = { imageUrl: '#', isShow: 'off' };

    const form = formidable({ multiples: true });
    form.parse(req);

    form.on('field', function(fieldName, fieldValue) {
        if (fieldName == 'parent' && fieldValue !== 'null') {
            content[fieldName] = fieldValue;
        } else if (fieldName !== 'parent') {
            content[fieldName] = fieldValue;
        }
        if (fieldName == 'typeImage') {
            if (fieldValue !== 'small') {
                resizeWidth = 770;
            }
        }

    });

    form.on('file', function(fieldName, file) {
        if (fieldName == 'imageUrl' && file.name !== '') {
            const imgName = uslug((new Date().getTime() + '-' + (content['name'] ? (slugFromTitle(content['name']) + '.jpg') : file.name)), { allowedChars: '.-', lower: true });
            var dir = __basedir + '/public/img/category';
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, 0744);
            }
            const img_path = path.join(__basedir, `public/img/category/${imgName}`);
            content.imageUrl = `/img/category/${imgName}`;
            resizeImages(resizeWidth, file.path, img_path);
        }
    });

    form.on('end', function() {
        Category.create(content, function(err, data) {
            if (!err) {
                req.flash('messages', 'Thêm loại SP thành công !')
                res.redirect('/admin/category');
            } else {
                if (err.code = 11000) {
                    req.flash('errors', err._message);
                } else {
                    req.flash('errors', 'Không thêm được loại sản phẩm')
                }
                res.redirect('back');
            }
        });
    })
});

//edit category
router.post('/edit-category/:id', function(req, res) {

    let resizeWidth = 370;
    let content = { isShow: 'off' };
    const idBanner = req.params.id;
    req.body.updated_date = new Date();
    const form = formidable({ multiples: true });
    form.parse(req);

    form.on('field', function(fieldName, fieldValue) {
        if (fieldName !== 'parent') {
            content[fieldName] = fieldValue;
        }
        if (fieldName == 'parent' && fieldValue !== 'null') {
            content[fieldName] = fieldValue;
        }
        if (fieldName == 'parent' && fieldValue == 'null') {
            content[fieldName] = null;
        }
        if (fieldName == 'typeImage') {
            if (fieldValue !== 'small') {
                resizeWidth = 770;
            }
        }
    });

    form.on('file', function(fieldName, file) {
        if (fieldName == 'imageUrl' && file.name !== '') {
            const imgName = uslug((new Date().getTime() + '-' + (content['name'] ? (slugFromTitle(content['name']) + '.jpg') : file.name)), { allowedChars: '.-', lower: true });
            var dir = __basedir + '/public/img/category';
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, 0744);
            }
            const img_path = path.join(__basedir, `public/img/category/${imgName}`);
            content['imageUrl'] = `/img/category/${imgName}`;
            resizeImages(resizeWidth, file.path, img_path);
        }
    });

    form.on('end', function() {
        Category.findOneAndUpdate({ _id: idBanner }, content, { new: true }, function(err, category) {
            updateCategoryInProduct(category);
            if (!err) {
                req.flash('messages', 'Sửa kho hàng thành công !');
                res.redirect('back');
            } else {
                req.flash('errors', 'Không sửa được Kho hàng');
                res.redirect('back');
            }
        });

    });

});

let updateCategoryInProduct = function(category) {
    let id = category._id.toString();
    Product.updateMany({ "category._id": id }, {
            $set: {
                "category.$.name": category.name,
                "category.$.urlSeo": category.urlSeo,
                "category.$.imageUrl": category.imageUrl,
                "category.$.text": category.name,
                "category.$.isShow": category.isShow,
                "category.$.typeImage": category.typeImage
            }
        }, { new: true },
        function(err, data) {
            if (err) {
                console.log(err);

            } else {
                console.log("update thành công")
            }
        }
    );
}

let deleteCategoryInProduct = function(category) {
    let _id = category._id.toString();
    Product.updateMany({ "category._id": _id }, { $pull: { 'category': { '_id': _id } } });
}

router.get('/delete/:id', isAuthenticated, function(req, res) {
    const id = req.params.id;
    const messages = [];
    Category.findOneAndDelete({
        _id: id,
    }, function(err, category) {
        if (!err) {
            deleteCategoryInProduct(category);
            messages.push('Xóa Thể loại SP thành công')
            req.flash('messages', messages)
            res.redirect('back');
        } else {
            messages.push('Không xóa được thể loại sản phẩm')
            req.flash('messages', messages)
            res.redirect('back');
        }
    });
});

module.exports = router;