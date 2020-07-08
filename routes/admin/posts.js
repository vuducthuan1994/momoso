var express = require('express');
var router = express.Router();
const Posts = require('../../models/postsModel');
const fs = require('fs');
const formidable = require('formidable');
var path = require('path');
var uslug = require('uslug');
const sharp = require('sharp');
const Category = require('../../models/categoryPostModel');

var isAuthenticated = function(req, res, next) {
    if (process.env.ENV == 'DEV') {
        return next();
    }
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}

let getCategory = function() {
    return new Promise(function(resolve, reject) {
        Category.find({}, function(err, categorys) {
            if (!err) {
                resolve(categorys);
            }
        });
    });
}

var slugFromTitle = function(str) {

    // Chuyển hết sang chữ thường
    str = str.toLowerCase();

    // xóa dấu
    str = str.replace(/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/g, 'a');
    str = str.replace(/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/g, 'e');
    str = str.replace(/(ì|í|ị|ỉ|ĩ)/g, 'i');
    str = str.replace(/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/g, 'o');
    str = str.replace(/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/g, 'u');
    str = str.replace(/(ỳ|ý|ỵ|ỷ|ỹ)/g, 'y');
    str = str.replace(/(đ)/g, 'd');

    // Xóa ký tự đặc biệt
    str = str.replace(/([^0-9a-z-\s])/g, '');

    // Xóa khoảng trắng thay bằng ký tự -
    str = str.replace(/(\s+)/g, '-');

    // xóa phần dự - ở đầu
    str = str.replace(/^-+/g, '');

    // xóa phần dư - ở cuối
    str = str.replace(/-+$/g, '');

    // return
    return str;
};

//get all posts
router.get('/', function(req, res) {
    Posts.find({}, function(err, posts) {
        if (!err) {
            res.render('admin/pages/posts/index', { errors: req.flash('errors'), messages: req.flash('messages'), title: "Quản lý bài viết", posts: posts.map(post => post.toJSON()), layout: 'admin.hbs' });
        }
    });
});

router.get('/add-post', async function(req, res) {
    let categorys = await getCategory();
    res.render('admin/pages/posts/add-post', {
        categorys: JSON.stringify(categorys),
        title: "Thêm bài viết",
        layout: 'admin.hbs'
    });
});

router.get('/edit-post/:id', async function(req, res) {
    const postId = req.params.id;
    let categorys = await getCategory();
    Posts.findOne({ _id: postId }, function(err, post) {
        if (err) {
            req.flash('messages', 'Lỗi hệ thống, không sửa được bài viết !')
            res.redirect('back');
        } else {
            res.render('admin/pages/posts/add-post', {
                errors: req.flash('errors'),
                messages: req.flash('messages'),
                title: "Sửa bài viết",
                categorys: JSON.stringify(categorys),
                layout: 'admin.hbs',
                post: post.toJSON(),
                categorySelected: JSON.stringify(post.category)
            });
        }
    })
});
router.post('/uploadImages', function(req, res) {
    let fileName = null;
    var photos = [],
        form = new formidable.IncomingForm();
    form.multiples = true;
    form.on('fileBegin', function(fieldName, file) {
        var dir = __basedir + '/public/artiles';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, 0744);
        }
        if (file.name !== '') {

            fileName = uslug((Date.now() + '-' + file.name), { allowedChars: '.-_', lower: true });
            file.path = path.join(__basedir, `public/artiles/${fileName}`);
            photos.push(`/artiles/${fileName}`);
        }
    });
    form.on('error', function(err) {
        console.log('Error occurred during processing - ' + err);
    });
    form.on('end', function() {
        var result = { fileName: fileName, uploaded: 1, url: photos[0] };
        res.send(JSON.stringify(result));
    });
    form.parse(req, function(err, field) {
        console.log(field);
    });
});

router.post('/edit-post/:id', function(req, res) {
    const idPost = req.params.id;
    let content = {};

    const form = formidable({ multiples: true });
    form.parse(req);

    form.on('field', function(fieldName, fieldValue) {
        if (fieldName !== 'category') {
            content[fieldName] = fieldValue;
        }
        if (fieldName == 'category') {
            content[fieldName] = JSON.parse(fieldValue);
        }
    });

    form.on('file', function(fieldName, file) {
        if (fieldName == 'banner_image' && file.name !== '') {
            var dir = __basedir + '/public/img/posts';
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, 0744);
            }
            const fileName = uslug((new Date().getTime() + '-' + (content['title'] ? (slugFromTitle(content['title']) + '.jpg') : file.name)), { allowedChars: '.-', lower: true });

            const thumb_path = path.join(__basedir, `public/img/posts/thumb-${fileName}`);
            const banner_path = path.join(__basedir, `public/img/posts/banner-${fileName}`);
            content['thumb_image'] = `/img/posts/thumb-${fileName}`;
            content['banner_image'] = `/img/posts/banner-${fileName}`;
            resizeImage(file.path, thumb_path, 370, 246);
            resizeImage(file.path, banner_path, 1770, 630);
        }
    });

    form.on('end', function() {
        if (content.isPublic) {
            content.isPublic = true;
        } else {
            content.isPublic = false;
        }
        if (content['category'] == undefined) {
            content['category'] = [];
        }
        Posts.findOneAndUpdate({ _id: idPost }, content, { new: true }, function(err, post) {
            if (!err) {
                req.res.json({
                    success: true,
                    data: post
                });
            } else {
                let msg = null;
                if (err.code = 11000) {
                    msg = err.errmsg;
                }
                res.json({
                    success: false,
                    msg: msg,
                    data: JSON.stringify(err)
                });
            }
        });
    });
});

let resizeImage = function(oldPath, newPath, width, height) {
        sharp(oldPath)
            .resize(width, height)
            .toFile(newPath, function(err) {
                if (err) {
                    console.log(err);
                }
            });
    }
    // create post
router.post('/', function(req, res) {
    let content = {};

    const form = formidable({ multiples: true });
    form.parse(req);
    form.on('field', function(fieldName, fieldValue) {
        if (fieldName !== 'banner_image' && fieldName !== 'category') {
            content[fieldName] = fieldValue;
        }
        if (fieldName == 'category') {
            content[fieldName] = JSON.parse(fieldValue);
        }
    });
    form.on('file', function(fieldName, file) {
        if (fieldName == 'banner_image' && file.name !== '') {
            var dir = __basedir + '/public/img/posts';
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, 0744);
            }
            const fileName = uslug((new Date().getTime() + '-' + (content['title'] ? (slugFromTitle(content['title']) + '.jpg') : file.name)), { allowedChars: '.-', lower: true });

            const thumb_path = path.join(__basedir, `public/img/posts/thumb-${fileName}`);
            const banner_path = path.join(__basedir, `public/img/posts/banner-${fileName}`);
            content['thumb_image'] = `/img/posts/thumb-${fileName}`;
            content['banner_image'] = `/img/posts/banner-${fileName}`;
            resizeImage(file.path, thumb_path, 370, 246);
            resizeImage(file.path, banner_path, 1770, 630);
        }
    });

    form.on('end', function() {
        if (content.isPublic) {
            content.isPublic = true;
        } else {
            content.isPublic = false;
        }
        Posts.create(content, function(err, post) {
            if (!err) {
                res.json({
                    success: true,
                    msg: 'Bài viết đã được thêm vào hệ thống !',
                    data: post
                });
            } else {
                let msg = null;
                if (err.code = 11000) {
                    msg = err.errmsg;
                } else {}
                res.json({
                    success: false,
                    msg: msg,
                    data: JSON.stringify(err)
                });
            }
        });
    });
});

router.get('/delete/:id', isAuthenticated, function(req, res) {
    const id = req.params.id;
    const messages = [];
    Posts.findOneAndDelete({
        _id: id,
    }, async function(err, post) {
        if (post && post.banner_image) {
            filePath = 'public' + post.banner_image;
            let resultDeleteImage = await deleteImage(filePath);
            messages.push(resultDeleteImage);
        }

        if (!err) {
            messages.push('Xóa bài viết thành công')
            req.flash('messages', messages)
            res.redirect('back');
        } else {
            messages.push('Xóa bài viết thất bại ')
            req.flash('messages', messages)
            res.redirect('back');
        }
    });
});

let deleteImage = function(filePath) {
    return new Promise(function(resolve, reject) {
        fs.unlink(filePath, function(err) {
            if (err) {
                resolve('Không thể xóa ảnh đại điện bài viết !')
            } else {
                resolve('Ảnh đại diện bài viết đã bị xóa!')
            }
        });
    })
}
module.exports = router;