var express = require('express');
var router = express.Router();
const checkDiskSpace = require('check-disk-space');

module.exports = function(cache) {

    router.get('/', function(req, res) {
        checkDiskSpace(__basedir).then(diskSpace => {
            console.log(__basedir);
            console.log(diskSpace);
            console.log(cache.getStats());
            // return res.json(cache.getStats());
            res.render('admin/pages/cache/index', { messages: req.flash('message'), cache: cache.getStats(), disk: diskSpace, title: "Quản lý cache", layout: 'admin.hbs' });
        });


    });

    router.get('/delete', function(req, res) {
        cache.flushAll();
        req.flash('message', 'Xóa cache thành công !')
        res.redirect('back');
    });
    return router;
}