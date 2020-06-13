var express = require('express');
var router = express.Router();
const Settings = require('../../../models/settingModel');


const formidable = require('formidable');
var path = require('path');


var isAuthenticated = function(req, res, next) {
    if (process.env.ENV == 'DEV') {
        return next();
    }
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}



router.get('/', isAuthenticated, function(req, res) {
    Settings.findOne({ type: 'about-us' }, function(err, about_us) {
        res.render('admin/pages/config/about-us/index', { messages: req.flash('messages'), title: "About us", about_us: about_us.toJSON(), layout: 'admin.hbs' });
    });
});
router.post('/', isAuthenticated, function(req, res) {
    const form = formidable({ multiples: true });
    form.on('fileBegin', function(name, file) {
        if (file.name !== '' && file.name !== undefined && file.name !== null) {
            file.path = path.join(__basedir, `public/img/${name}.png`);
        }
    });
    form.parse(req, (err, fields) => {
        if (err) {
            req.flash('messages', "Update không thành cong !");
        } else {
            Settings.updateOne({ type: 'introduction' }, { content: fields }, function(err, data) {
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