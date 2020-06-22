var express = require('express');
var router = express.Router();
const CategoryPost = require('../../models/categoryPostModel');
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


//get all category post
router.get('/', isAuthenticated, function(req, res) {
    CategoryPost.find({}, function(err, categorys) {
        if (!err) {
            res.render('admin/pages/category/index', {
                errors: req.flash('errors'),
                messages: req.flash('messages'),
                title: "Quản Lý Thể Loại Bài Viết",
                categorys: categorys.map(category => category.toJSON()),
                layout: 'admin.hbs'
            });
        }
    });
});
router.get('/add-category', isAuthenticated, function(req, res) {
    res.render('admin/pages/categoryPost/add-category', {
        errors: req.flash('errors'),
        messages: req.flash('messages'),
        title: "Thêm Thể Loại Bài Viết",
        layout: 'admin.hbs'
    });
});

router.get('/edit-category/:id', isAuthenticated, function(req, res) {
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
                category: category ? category.toJSON() : null
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
router.post('/', function(req, res) {
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

    form.on('file', function(fieldName, file) {
        if (fieldName == 'imageUrl' && file.name !== '') {
            const imgName = uslug((new Date().getTime() + '-' + file.name), { allowedChars: '.', lower: true });
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
    let content = {};
    const idBanner = req.params.id;
    req.body.updated_date = new Date();
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