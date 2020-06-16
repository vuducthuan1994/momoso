var express = require('express');
var router = express.Router();
const sharp = require('sharp');
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
    });
});
router.get('/add-category', isAuthenticated, function(req, res) {
    res.render('admin/pages/category/add-category', {
        errors: req.flash('errors'),
        messages: req.flash('messages'),
        title: "Thêm Loại SP",
        layout: 'admin.hbs'
    });
});

router.get('/edit-category/:id', isAuthenticated, function(req, res) {
    const categoryID = req.params.id;
    Category.findOne({ _id: categoryID }, function(err, storage) {
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


// create category
router.post('/', async function(req, res) {
    let resizeWidth = 370;
    let content = { imageUrl: '#' };
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
                    }).toFile(img_path, function(err) {
                        if (!err) {
                            req.flash('messages', 'Ảnh đã được resize đúng kích cỡ !');
                            content.imageUrl = `/img/category/${imgName}`;
                            resolve();
                        } else {
                            reject();
                        }
                    });
            }
        });
    });
    Category.create(content, function(err, data) {
        if (!err) {
            req.flash('messages', 'Thêm thành công !')
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
});
//edit storage
router.post('/edit-storage/:id', function(req, res) {
    const idBanner = req.params.id;
    req.body.updated_date = new Date();
    Category.updateOne({ _id: idBanner }, req.body, function(err, data) {
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
    Storage.findOneAndDelete({
        _id: id,
    }, function(err, storage) {
        if (!err) {
            messages.push('Xóa Kho thành công')
            req.flash('messages', messages)
            res.redirect('back');
        } else {
            messages.push('Xóa Kho thất bại ')
            req.flash('messages', messages)
            res.redirect('back');
        }
    });
});

module.exports = router;