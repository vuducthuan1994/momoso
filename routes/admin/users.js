var express = require('express');
var router = express.Router();
const Users = require('../../models/userModel');
var bCrypt = require('bcrypt');
var { validationResult } = require('express-validator');
var { validate } = require('../validator');

var isAuthenticated = function(req, res, next) {
    if (process.env.ENV == 'DEV') {
        return next();
    }
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}


router.get('/', isAuthenticated, function(req, res) {
    Users.find({}, function(err, users) {
        res.render('admin/pages/users/index', { messages: req.flash('message'), title: "Member", users: users.map(user => user.toJSON()), layout: 'admin.hbs' });
    }).sort({ updated_date: -1 });
});
router.get('/edit-user/:id', isAuthenticated, function(req, res) {
    Users.findOne({ _id: req.params.id }, function(err, user) {
        res.render('admin/pages/users/edit-user', { messages: req.flash('message'), validateErrors: req.flash('validateErrors'), user: user.toJSON(), title: "Chỉnh sửa người dùng", layout: 'admin.hbs' });
    });
});

router.get('/delete/:id', isAuthenticated, function(req, res) {
    Users.remove({
        _id: id,
    }, function(err) {
        if (!err) {
            req.flash('message', 'Delete User Success !')
            res.redirect('back');
        } else {
            req.flash('message', 'Delete User Fail ! !')
            res.redirect('back');
        }
    });

});

router.post('/edit-user', validate.validateEditUSer(), function(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('validateErrors', errors.errors)
        res.redirect('back');
        return;
    } else {
        let updateUser = Object.assign({}, req.body);
        updateUser.hash_password = createHash(req.body.hash_password);
        console.log(updateUser);
        Users.findOneAndUpdate({ account: updateUser.account }, updateUser, function(err, data) {
            if (!err) {
                req.flash('message', 'Cập nhật thành công !')
                res.redirect('back');
            }
        })
    }
});

// Generates hash using bCrypt
var createHash = function(password) {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}
module.exports = router;