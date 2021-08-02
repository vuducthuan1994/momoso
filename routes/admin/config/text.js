var express = require('express');
var router = express.Router();
const Settings = require('../../../models/settingModel');
const sharp = require('sharp');

const formidable = require('formidable');
var path = require('path');


var isAuthenticated = function (req, res, next) {
    if (process.env.ENV == 'DEV') {
        return next();
    }
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}

let resizeImages = function (oldPath, newPath) {
    return new Promise(function (resolve, reject) {
        sharp(oldPath)
            .resize(1770, 630, {
                fit: "cover"
            }).toFile(newPath, function (err) {
                if (!err) {
                    resolve(true);
                } else {
                    console.log(err);
                    resolve(false);
                }
            });
    });
}

router.get('/', isAuthenticated, function (req, res) {
    Settings.findOne({ type: 'text' }, function (err, data) {
       
        res.render('admin/pages/config/about-us/index', { messages: req.flash('messages'), title: "Tất cả trang tĩnh", data: data, layout: 'admin.hbs' });
    }).lean();
});

router.post('/', isAuthenticated, function (req, res) {
    const form = formidable({ multiples: true });
    form.on('file', async function (name, file) {
        if (file.name !== '' && file.name !== null && name == 'banner-about-us') {
            newPath = path.join(__basedir, `public/img/about-us.jpg`);
            let resize = await resizeImages(file.path, newPath);
            if (resize) {
                req.flash('messages', 'Ảnh đã được resize thành công !');
            }
        }
    });
    form.parse(req, (err, fields) => {

        if (err) {
            req.flash('messages', "Update không thành cong !");
        } else {
            Settings.updateOne({ type: 'text' }, { content: fields }, function (err, data) {
                if (!err) {
                    req.flash('messages', 'Update thành công !')
                    res.redirect('back');
                } else {
                    req.flash('messages', 'Update không thành công công !')
                    res.redirect('back');
                }
            });
        }
    });
});



module.exports = router;