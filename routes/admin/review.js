var express = require('express');
var router = express.Router();
const Review = require('../../models/reviewModel');
var isAuthenticated = function(req, res, next) {
    if (process.env.ENV == 'DEV') {
        return next();
    }
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}


//get all storage
router.get('/', isAuthenticated, function(req, res) {
    Review.find({}, function(err, reviews) {
        if (!err) {
            res.render('admin/pages/review/index', {
                errors: req.flash('errors'),
                messages: req.flash('messages'),
                title: "Quản Lý Bình Luận ",
                reviews: reviews.map(review => review.toJSON()),
                layout: 'admin.hbs'
            });
        }
    });
});


router.get('/updateStatus/:id', isAuthenticated, function(req, res) {
    const id = req.params.id;
    const messages = [];
    Review.findOneAndUpdate({
        _id: id,
    }, { public: true }, function(err, review) {
        if (!err) {
            messages.push('Bình luận đã được công khai!')
            req.flash('messages', messages)
            res.redirect('back');
        } else {
            messages.push('Cập nhật trạng thái bình luận thất bại!')
            req.flash('messages', messages)
            res.redirect('back');
        }
    });
});

router.get('/delete/:id', isAuthenticated, function(req, res) {
    const id = req.params.id;
    const messages = [];
    Review.findOneAndDelete({
        _id: id,
    }, function(err, review) {
        if (!err) {
            messages.push('Xóa bình luận thành công !')
            req.flash('messages', messages)
            res.redirect('back');
        } else {
            messages.push('Xóa bình luận thất bại !')
            req.flash('messages', messages)
            res.redirect('back');
        }
    });
});



module.exports = router;