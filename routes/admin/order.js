var express = require('express');
var router = express.Router();
const Orders = require('../../models/orderModel');


var isAuthenticated = function(req, res, next) {
    if (process.env.ENV == 'DEV') {
        return next();
    }
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}


//get all order
router.get('/', isAuthenticated, function(req, res) {
    Orders.find({}, function(err, orders) {
        if (!err) {
            res.render('admin/pages/order/index', {
                errors: req.flash('errors'),
                messages: req.flash('messages'),
                title: "Danh sách đơn hàng",
                orders: orders.map(order => order.toJSON()),
                layout: 'admin.hbs'
            });
        }
    });
});

module.exports = router;