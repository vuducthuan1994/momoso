var express = require('express');
var router = express.Router();
const Subscribe = require('../../models/subscribeModel');
var isAuthenticated = function(req, res, next) {
    if (process.env.ENV == 'DEV') {
        return next();
    }
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}


//get all subscribe email
router.get('/', isAuthenticated, function(req, res) {
    Subscribe.find({}, function(err, subscribes) {
        if (!err) {
            res.render('admin/pages/subscribe/index', {
                errors: req.flash('errors'),
                messages: req.flash('messages'),
                title: "Quản Lý Email Đăng Ký Theo Dõi",
                subscribes: subscribes.map(subscribe => subscribe.toJSON()),
                layout: 'admin.hbs'
            });
        }
    });
});


router.get('/delete/:id', isAuthenticated, function(req, res) {
    const id = req.params.id;
    Subscribe.findOneAndDelete({
        _id: id,
    }, function(err, storage) {
        if (!err) {
            req.flash('messages', 'Xóa Email Thành Công')
            res.redirect('back');
        }
    });
});




module.exports = router;