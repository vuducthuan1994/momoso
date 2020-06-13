var express = require('express');
var router = express.Router();
const Storage = require('../../models/storageModel');
var path = require('path');
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
    Storage.find({}, function(err, storages) {
        if (!err) {
            res.render('admin/pages/storage/index', { errors: req.flash('errors'), messages: req.flash('messages'), title: "Quản lý banner", storages: storages.map(storage => storage.toJSON()), layout: 'admin.hbs' });
        }
    });
});
router.get('/add-storage', function(req, res) {
    // res.render('admin/pages/storage/add-banner', { title: "Thêm Banner", layout: 'admin.hbs' });
});

router.get('/edit-post/:id', function(req, res) {
    // const storageID = req.params.id;
    // Storage.findOne({ _id: storageID }, function(err, storage) {
    //     if (err) {
    //         req.flash('messages', 'Lỗi hệ thống, không sửa được banner !')
    //         res.redirect('back');
    //     } else {
    //         res.render('admin/pages/storage/add-banner', { errors: req.flash('errors'), messages: req.flash('messages'), title: "Sửa banner", layout: 'admin.hbs', storage: storage.toJSON() });
    //     }
    // })
});

// create banner
router.post('/', function(req, res) {
    console.log(req.body)

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
            Storage.updateOne({ _id: idBanner }, fields, function(err, data) {
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
    Storage.findOneAndDelete({
        _id: id,
    }, async function(err, banner) {
        if (banner && banner.imageUrl) {
            filePath = 'public' + banner.imageUrl;
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




module.exports = router;