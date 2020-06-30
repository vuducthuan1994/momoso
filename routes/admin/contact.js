var express = require('express');
var router = express.Router();
const Contacts = require('../../models/contactModel');
var isAuthenticated = function(req, res, next) {
    if (process.env.ENV == 'DEV') {
        return next();
    }
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}


//get all contacts
router.get('/', isAuthenticated, function(req, res) {
    Contacts.find({}, function(err, contacts) {
        if (!err) {
            res.render('admin/pages/review/index', {
                errors: req.flash('errors'),
                messages: req.flash('messages'),
                title: "Quản Lý Lời Nhắn Từ Khách hàng",
                contacts: contacts.map(contact => contact.toJSON()),
                layout: 'admin.hbs'
            });
        }
    }).sort({ created_date: -1 });
});


router.get('/delete/:id', isAuthenticated, function(req, res) {
    const id = req.params.id;
    const messages = [];
    Contacts.findOneAndDelete({
        _id: id,
    }, function(err, review) {
        if (!err) {
            messages.push('Xóa thư liên hệ thành công !')
            updateTotalReviewInProduct(review, -1);
            req.flash('messages', messages)
            res.redirect('back');
        } else {
            messages.push('Xóa thư liên hệ thất bại !')
            req.flash('messages', messages)
            res.redirect('back');
        }
    });
});



module.exports = router;