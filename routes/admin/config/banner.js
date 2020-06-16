var express = require('express');
var router = express.Router();
const Banners = require('../../../models/config/bannerModel');

var fs = require('fs');
const formidable = require('formidable');
var path = require('path');
var uslug = require('uslug');
var isAuthenticated = function(req, res, next) {
    console.log(req.isAuthenticated());
    if (process.env.ENV == 'DEV') {
        return next();
    }
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}


//get all posts
router.get('/', isAuthenticated, function(req, res) {
    Banners.find({}, function(err, banners) {
        if (!err) {
            res.render('admin/pages/config/banner/index', { errors: req.flash('errors'), messages: req.flash('messages'), title: "Quản lý banner", banners: banners.map(banner => banner.toJSON()), layout: 'admin.hbs' });
        }
    });
});
router.get('/add-banner', function(req, res) {
    res.render('admin/pages/config/banner/add-banner', { title: "Thêm Banner", layout: 'admin.hbs' });
});

router.get('/edit-post/:id', function(req, res) {
    const bannerID = req.params.id;
    Banners.findOne({ _id: bannerID }, function(err, banner) {
        if (err) {
            req.flash('messages', 'Lỗi hệ thống, không sửa được banner !')
            res.redirect('back');
        } else {
            res.render('admin/pages/config/banner/add-banner', { errors: req.flash('errors'), messages: req.flash('messages'), title: "Sửa banner", layout: 'admin.hbs', banner: banner.toJSON() });
        }
    })
});

// create banner
router.post('/', function(req, res) {
    let imageUrl = null;
    const form = formidable({ multiples: true });
    form.on('file', function(fieldName, file) {
        if (fieldName == 'imageUrl' && file.name !== '') {
            var dir = __basedir + '/public/img/banner';
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, 0744);
            }
            imageUrl = uslug((new Date().getTime() + '-' + file.name), { allowedChars: '.', lower: true });
            newPath = path.join(dir, `/${imageUrl}`);
            sharp(file.path)
                .resize(1770, 700)
                .toFile(newPath, function(err) {
                    if (!err) {
                        req.flash('messages', 'Image was resize !')
                    }
                });
        }
    });

    form.parse(req, (err, fields) => {
        if (newPath !== null) {
            fields.imageUrl = `/img/banner/${imageUrl}`;
        }
        if (fields.isShow) {
            fields.isShow = true;
        } else {
            fields.isShow = false;
        }
        if (err) {
            req.flash('messages', "Không thêm được Banner!");
            res.redirect('back');
        } else {
            Banners.create(fields, function(err, data) {
                if (!err) {
                    req.flash('messages', 'Thêm thành Banner công !')
                    res.redirect('/admin/config/banner');

                } else {
                    req.flash('messages', 'Không thêm được Banner')
                    res.redirect('back');
                }
            });
        }
    });
});
//edit banner
router.post('/edit-banner/:id', function(req, res) {
    const idBanner = req.params.id;
    let imageUrl = null;
    const form = formidable({ multiples: true });
    form.on('fileBegin', function(name, file) {
        var dir = __basedir + '/public/img/banner';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, 0744);
        }
        if (name == 'imageUrl' && file.name !== '') {
            imageUrl = uslug((new Date().getTime() + '-' + file.name), { allowedChars: '.', lower: true });
            file.path = path.join(dir, `/${imageUrl}`);
        }
    });
    form.parse(req, (err, fields) => {
        if (imageUrl !== null) {
            fields.imageUrl = `/img/banner/${imageUrl}`;
        }
        if (err) {
            req.flash('errors', "Không sửa được banner!");
        } else {
            fields.updated_date = new Date();
            Banners.updateOne({ _id: idBanner }, fields, function(err, data) {
                if (!err) {
                    req.flash('messages', 'Sửa thành công !');
                    res.redirect('back');
                } else {
                    req.flash('errors', 'Không sửa được banner');
                    res.redirect('back');
                }
            });
        }
    });

});

router.get('/delete/:id', isAuthenticated, function(req, res) {
    const id = req.params.id;
    const messages = [];
    Banners.findOneAndDelete({
        _id: id,
    }, async function(err, banner) {
        if (banner && banner.imageUrl) {
            filePath = 'public' + banner.imageUrl;
            let resultDeleteImage = await deleteImage(filePath);
            messages.push(resultDeleteImage);
        }

        if (!err) {
            messages.push('Xóa banner thành công')
            req.flash('messages', messages)
            res.redirect('back');
        } else {
            messages.push('Xóa banner thất bại ')
            req.flash('messages', messages)
            res.redirect('back');
        }
    });
});

let deleteImage = function(filePath) {
    return new Promise(function(resolve, reject) {
        fs.unlink(filePath, function(err) {
            if (err) {
                resolve('Không thể xóa ảnh đại điện banner !')
            } else {
                resolve('Ảnh Banner đã bị xóa khỏi ổ cứng!')
            }
        });
    })
}


module.exports = router;