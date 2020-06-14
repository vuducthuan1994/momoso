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
            res.render('admin/pages/storage/index', {
                errors: req.flash('errors'),
                messages: req.flash('messages'),
                title: "Quản Lý Kho Hàng",
                storages: storages.map(storage => storage.toJSON()),
                layout: 'admin.hbs'
            });
        }
    });
});
router.get('/add-storage', isAuthenticated, function(req, res) {
    res.render('admin/pages/storage/add-storage', {
        errors: req.flash('errors'),
        messages: req.flash('messages'),
        title: "Thêm Banner",
        layout: 'admin.hbs'
    });
});

router.get('/edit-storage/:id', isAuthenticated, function(req, res) {
    const storageID = req.params.id;
    Storage.findOne({ _id: storageID }, function(err, storage) {
        if (err) {
            req.flash('messages', 'Lỗi hệ thống, không sửa được banner !')
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

// create storage
router.post('/', function(req, res) {
    console.log(req.body)
    Storage.create(req.body, function(err, data) {
        if (!err) {
            req.flash('messages', 'Thêm thành công !')
            res.redirect('/admin/storage');

        } else {
            console.log(err);
            if (err.code = 11000) {
                req.flash('errors', `Thông tin lỗi:  ${err.errmsg}`)
            } else {
                req.flash('errors', 'Không thêm được kho hàng , liên hệ admin')
            }
            // res.redirect('back');
        }
    });

});
//edit storage
router.post('/edit-storage/:id', function(req, res) {
    const idBanner = req.params.id;
    req.body.updated_date = new Date();
    Storage.updateOne({ _id: idBanner }, req.body, function(err, data) {
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