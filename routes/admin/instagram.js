var express = require('express');
var router = express.Router();
const sharp = require('sharp');
const Instagram = require('../../models/instagramModel');
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
    Instagram.find({}, function(err, instagrams) {
        if (!err) {
            res.render('admin/pages/instagram/index', {
                errors: req.flash('errors'),
                messages: req.flash('messages'),
                title: "Quản Lý Instaram Post",
                instagrams: instagrams.map(instagram => instagram.toJSON()),
                layout: 'admin.hbs'
            });
        }
    }).sort({ updated_date: -1 });
});

router.get('/add-instagram', isAuthenticated, function(req, res) {
    res.render('admin/pages/instagram/add-instagram', {
        errors: req.flash('errors'),
        messages: req.flash('messages'),
        title: "Thêm Instagram Post",
        layout: 'admin.hbs'
    });
});

router.get('/edit-instagram/:id', isAuthenticated, function(req, res) {
    const instagramID = req.params.id;
    Category.findOne({ _id: instagramID }, function(err, category) {
        if (err) {
            req.flash('messages', 'Lỗi hệ thống, không sửa được Loại SP !')
            res.redirect('back');
        } else {
            res.render('admin/pages/category/add-category', {
                errors: req.flash('errors'),
                messages: req.flash('messages'),
                title: "Sửa Thông Tin Kho Hàng",
                layout: 'admin.hbs',
                category: category ? category.toJSON() : null
            });
        }
    })
});

let resizeImages = function(oldPath, newPath) {
        sharp(oldPath)
            .resize(400, 400, {
                fit: "cover"
            }).toFile(newPath, function(err) {

            });
    }
    // create category
router.post('/', async function(req, res) {
    let content = { imageUrl: '#', isShow: 'off' };

    const form = formidable({ multiples: true });
    form.parse(req);

    form.on('field', function(fieldName, fieldValue) {
        content[fieldName] = fieldValue;
        if (fieldName == 'typeImage') {
            if (fieldValue !== 'small') {
                resizeWidth = 770;
            }
        }

    });

    form.on('file', function(fieldName, file) {
        if (fieldName == 'imageUrl' && file.name !== '') {
            const imgName = uslug((new Date().getTime() + '-' + file.name), { allowedChars: '.', lower: true });
            var dir = __basedir + '/public/img/instagram';
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, 0744);
            }
            const img_path = path.join(__basedir, `public/img/instagram/${imgName}`);
            content.imageUrl = `/img/instagram/${imgName}`;
            resizeImages(resizeWidth, file.path, img_path);
        }
    });

    form.on('end', function() {
        Category.create(content, function(err, data) {
            if (!err) {
                req.flash('messages', 'Thêm loại SP thành công !')
                res.redirect('/admin/instagram');
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
router.post('/edit-instagram/:id', function(req, res) {

    let resizeWidth = 370;
    let content = { isShow: 'off' };
    const idBanner = req.params.id;
    req.body.updated_date = new Date();
    const form = formidable({ multiples: true });
    form.parse(req);

    form.on('field', function(fieldName, fieldValue) {
        content[fieldName] = fieldValue;
        if (fieldName == 'typeImage') {
            if (fieldValue !== 'small') {
                resizeWidth = 770;
            }
        }
    });

    form.on('file', function(fieldName, file) {
        if (fieldName == 'imageUrl' && file.name !== '') {
            const imgName = uslug((new Date().getTime() + '-' + file.name), { allowedChars: '.', lower: true });
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