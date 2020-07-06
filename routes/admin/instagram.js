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
    Instagram.findOne({ _id: instagramID }, function(err, instagram) {
        if (err) {
            req.flash('messages', 'Lỗi hệ thống, không sửa được instagram post!')
            res.redirect('back');
        } else {
            res.render('admin/pages/instagram/add-instagram', {
                errors: req.flash('errors'),
                messages: req.flash('messages'),
                title: "Sửa Instagram Post",
                layout: 'admin.hbs',
                instagram: instagram ? instagram.toJSON() : null
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
    // create instagram
router.post('/', async function(req, res) {
    let content = {};

    const form = formidable({ multiples: true });
    form.parse(req);

    form.on('field', function(fieldName, fieldValue) {
        content[fieldName] = fieldValue;
    });

    form.on('file', function(fieldName, file) {
        if (fieldName == 'image' && file.name !== '') {
            const imgName = uslug((new Date().getTime() + '-' + (content['name'] ? (slugFromTitle(content['name']) + '.jpg') : file.name)), { allowedChars: '.-', lower: true });
            var dir = __basedir + '/public/img/instagram';
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, 0744);
            }
            const img_path = path.join(__basedir, `public/img/instagram/${imgName}`);
            content.image = `/img/instagram/${imgName}`;
            resizeImages(file.path, img_path);
        }
    });

    form.on('end', function() {
        Instagram.create(content, function(err, data) {
            if (!err) {
                req.flash('messages', 'Thêm instagram post thành công  !')
                res.redirect('/admin/instagram');
            } else {
                if (err.code = 11000) {
                    req.flash('errors', err._message);
                } else {
                    req.flash('errors', 'Không thêm được post instagram !')
                }
                res.redirect('back');
            }
        });
    })
});

//edit category
router.post('/edit-instagram/:id', function(req, res) {

    let content = {};
    const idInstagram = req.params.id;
    req.body.updated_date = new Date();
    const form = formidable({ multiples: true });
    form.parse(req);

    form.on('field', function(fieldName, fieldValue) {
        content[fieldName] = fieldValue;
    });

    form.on('file', function(fieldName, file) {
        if (fieldName == 'image' && file.name !== '') {
            const imgName = uslug((new Date().getTime() + '-' + (content['name'] ? (slugFromTitle(content['name']) + '.jpg') : file.name)), { allowedChars: '.', lower: true });
            var dir = __basedir + '/public/img/instagram';
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, 0744);
            }
            const img_path = path.join(__basedir, `public/img/instagram/${imgName}`);
            content['image'] = `/img/instagram/${imgName}`;
            resizeImages(file.path, img_path);
        }
    });

    form.on('end', function() {
        Instagram.findOneAndUpdate({ _id: idInstagram }, content, function(err, instagram) {
            if (!err) {
                req.flash('messages', 'Sửa Instagram Post thành công !');
                res.redirect('back');
            } else {
                req.flash('errors', 'Không sửa được Instagram Post !');
                res.redirect('back');
            }
        });

    });

});

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

router.get('/delete/:id', isAuthenticated, function(req, res) {
    const id = req.params.id;
    const messages = [];
    Instagram.findOneAndDelete({
        _id: id,
    }, function(err, instagram) {
        if (!err) {
            messages.push(`Xóa Instagram post ${instagram.name} thành công`)
            req.flash('messages', messages)
            res.redirect('back');
        } else {
            messages.push('Lỗi hệ thống , không xóa được Instagram Post')
            req.flash('messages', messages)
            res.redirect('back');
        }
    });
});

module.exports = router;