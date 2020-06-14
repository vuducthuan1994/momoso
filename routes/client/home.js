var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    res.render('client/index', {
        title: "Sửa Thông Tin Kho Hàng",
        layout: 'client.hbs',
    });
});


module.exports = router;