var express = require('express');
var router = express.Router();
const CategoryPost = require('../../models/categoryPostModel');
const Posts = require('../../models/postsModel');;

var isAuthenticated = function(req, res, next) {
    if (process.env.ENV == 'DEV') {
        return next();
    }
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}


//get all category post
router.get('/', isAuthenticated, function(req, res) {
    CategoryPost.find({}, function(err, categorys) {
        if (!err) {
            res.render('admin/pages/categoryPost/index', {
                errors: req.flash('errors'),
                messages: req.flash('messages'),
                title: "Quản Lý Thể Loại Bài Viết",
                categorys: categorys.map(category => category.toJSON()),
                layout: 'admin.hbs'
            });
        }
    });
});

router.get('/add-category', isAuthenticated, function(req, res) {
    res.render('admin/pages/categoryPost/add-category', {
        errors: req.flash('errors'),
        messages: req.flash('messages'),
        title: "Thêm Thể Loại Bài Viết",
        layout: 'admin.hbs'
    });
});

router.get('/edit-category/:id', isAuthenticated, function(req, res) {
    const categoryID = req.params.id;
    CategoryPost.findOne({ _id: categoryID }, function(err, category) {
        if (err) {
            req.flash('messages', 'Lỗi hệ thống, không sửa được Loại SP !')
            res.redirect('back');
        } else {
            res.render('admin/pages/categoryPost/add-category', {
                errors: req.flash('errors'),
                messages: req.flash('messages'),
                title: "Sửa Thông Tin Category Post",
                layout: 'admin.hbs',
                category: category ? category.toJSON() : null
            });
        }
    })
});


// create category post
router.post('/', isAuthenticated, function(req, res) {
    console.log(req.body);
    CategoryPost.create(req.body, function(err, data) {
        if (!err) {
            req.flash('messages', 'Thêm thể loại bài viết thành công !')
            res.redirect('back');
        } else {
            req.flash('errors', 'Không thêm được thể loại bài viết!, vui lòng kiểm tra lại các trường !')
            res.redirect('back');
        }
    });
});

//edit category
router.post('/edit-category/:id', function(req, res) {
    const idCategory = req.params.id;
    CategoryPost.findOneAndUpdate({ _id: idCategory }, req.body, { new: true }, function(err, category) {
        if (!err) {
            req.flash("messages", 'Update thành công ! ');
            res.redirect('back');
            updateCategoryInPosts(category);
        } else {
            req.flash("errors", 'Không update được bài viết! ');
            res.redirect('back');
        }
    });
});

let updateCategoryInPosts = function(category) {
    let id = category._id.toString();
    Posts.updateMany({ "category._id": id }, {
            $set: {
                "category.$.name": category.name,
                "category.$.urlSeo": category.urlSeo,
                "category.$.text": category.name
            }
        }, { new: true },
        function(err, data) {
            if (err) {
                console.log(err);

            } else {
                console.log("update thành công")
            }
        }
    );
}

let deleteCategoryInProduct = function(category) {
    let _id = category._id.toString();
    Product.updateMany({ "category._id": _id }, { $pull: { 'category': { '_id': _id } } });
}

router.get('/delete/:id', isAuthenticated, function(req, res) {
    const id = req.params.id;
    const messages = [];
    Category.findOneAndDelete({
        _id: id,
    }, function(err, category) {
        if (!err) {
            deleteCategoryInProduct(category);
            messages.push('Xóa Thể loại SP thành công')
            req.flash('messages', messages)
            res.redirect('back');
        } else {
            messages.push('Không xóa được thể loại sản phẩm')
            req.flash('messages', messages)
            res.redirect('back');
        }
    });
});

module.exports = router;