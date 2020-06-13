var express = require('express');
var router = express.Router();
const Settings = require('../../../models/settingModel');
var uslug = require('uslug');
var fs = require('fs');
const formidable = require('formidable');
var path_image = require('path');


var isAuthenticated = function(req, res, next) {
    if (process.env.ENV == 'DEV') {
        return next();
    }
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}



router.get('/', isAuthenticated, function(req, res) {
    Settings.findOne({ type: 'general' }, function(err, config) {
        res.render('admin/pages/config/general/index', { messages: req.flash('message'), title: "Cấu hình chung", config: config.toJSON(), layout: 'admin.hbs' });
    });
});
router.post('/', isAuthenticated, function(req, res) {
    var form = new formidable.IncomingForm();

    form.parse(req, (err, fields, files) => {
        var dir = __basedir + '/public/pdf';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, 0744);
        }
        if (err) {
            req.flash('messages', "Update không thành cong !");
        } else {
            for (var index in files) {
                if (files[index].name !== '') {
                    var newPath = path_image.join(__basedir, 'public/img') + '/' + `${index}.png`
                    var oldPath = files[index].path;
                    var rawData = fs.readFileSync(oldPath)
                    fs.writeFile(newPath, rawData, function(err) {
                        if (err) console.log(err)
                    });
                }
            }

            Settings.updateOne({ type: 'general' }, { content: fields }, function(err, data) {
                if (!err) {
                    req.flash('messages', 'Update thành công !')

                } else {
                    req.flash('messages', 'Update không thành công công !')
                }
            });
        }
    });
    form.on('end', function() {});
    res.redirect('back');
});
module.exports = router;