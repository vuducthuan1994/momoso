var express = require('express');
var router = express.Router();
const Storage = require('../../models/storageModel');
const Product = require('../../models/productModel');
const HistoryStorage = require('../../models/storageHistoryModel');
const formidable = require('formidable');

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
        title: "Thêm Kho Hàng Mới",
        layout: 'admin.hbs'
    });
});

router.get('/edit-storage/:idStorage', isAuthenticated, function(req, res) {
    const storageID = req.params.idStorage;
    Storage.findById({ _id: storageID }, function(err, storage) {
        if (err) {
            req.flash('messages', 'Lỗi hệ thống, không sửa được kho !')
            res.redirect('back');
        } else {
            res.render('admin/pages/storage/add-storage', {
                errors: req.flash('errors'),
                messages: req.flash('messages'),
                title: "Sửa Thông Tin Kho Hàng",
                layout: 'admin.hbs',
                storage: storage ? storage.toJSON() : null
            });
        }
    })
});

let deleteStorageInProduct = function(storage) {
    let _id = storage._id.toString();
    Product.updateMany({ "storage._id": _id }, { $pull: { 'storage': { '_id': _id } } });
}


// create storage
router.post('/', function(req, res) {
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
    const idStorage = req.params.id;
    req.body.updated_date = new Date();
    Storage.findOneAndUpdate({ _id: idStorage }, req.body, { new: true }, function(err, storage) {
        if (!err) {
            req.flash('messages', 'Sửa kho hàng thành công !');
            updateStorageInProduct(storage);
            res.redirect('back');
        } else {
            req.flash('errors', 'Không sửa được Kho hàng');
            res.redirect('back');
        }
    });

});

let updateStorageInProduct = function(storage) {
    let id = storage._id.toString();
    Product.updateMany({ "storage._id": id }, {
            $set: {
                "storage.$.phone_number": storage.phone_number,
                "storage.$.address": storage.address,
                "storage.$.name": storage.name,
                "storage.$.shortcutName": storage.shortcutName,
                "storage.$.note": storage.note,
                "storage.$.text": storage.name
            }
        }, { new: true },
        function(err, data) {
            if (err) {
                console.log(err);
            } else {
                console.log("update thành công cho tat ca san pham")
            }
        }
    );
}

router.get('/delete/:id', isAuthenticated, function(req, res) {
    const id = req.params.id;
    const messages = [];
    Storage.findOneAndDelete({
        _id: id,
    }, function(err, storage) {
        if (!err) {
            messages.push('Xóa Kho thành công');
            deleteStorageInProduct(storage);
            req.flash('messages', messages);
            res.redirect('back');;
        } else {
            messages.push('Xóa Kho thất bại ')
            req.flash('messages', messages)
            res.redirect('back');
        }
    });
});


// IMPORT EXPORT PRODUCT TO STORAGE
let getStorage = function() {
    return new Promise(function(resolve, reject) {
        Storage.find({}, { note: 0, phone_number: 0, updated_date: 0, created_date: 0, __v: 0, shortcutName: 0 }, function(err, storages) {
            if (!err) {
                resolve(storages);
            }
        });
    });
}

let getProducts = function() {
    return new Promise(function(resolve, reject) {
        Product.find({}, { updated_date: 0, created_date: 0, category: 0, note: 0, price: 0, detail: 0, urlSeo: 0, view: 0, __v: 0, type: 0, rate: 0, totalReview: 0, point: 0, quantity: 0 }, function(err, products) {
            if (!err) {
                resolve(products);
            }
        });
    });
}

router.get('/import-product', async function(req, res) {
    let storages = await getStorage();
    let products = await getProducts();
    res.render('admin/pages/storage/import-product', {
        errors: req.flash('errors'),
        messages: req.flash('messages'),
        storages: JSON.stringify(storages),
        products: JSON.stringify(products),
        title: "Nhập / Xuất Kho",
        layout: 'admin.hbs'
    });
});

router.post('/import-product/:id', async function(req, res) {
    const form = formidable({ multiples: true });
    form.parse(req, function(err, fields) {
        if (!err) {
            fields.product = JSON.parse(fields.product);
            fields.color = JSON.parse(fields.color);
            fields.size = JSON.parse(fields.size);
            fields.storage = JSON.parse(fields.storage);
            HistoryStorage.create(fields, function(err, data) {
                if (!err) {
                    updateTotalProduct(fields.type, fields.quantity, fields.product);
                    res.json({
                        success: true,
                        msg: 'Nhập/Xuất Kho Thành Công'
                    })
                } else {
                    res.json({
                        success: false,
                        msg: 'Nhập/Xuất Kho Thất Bại'
                    })
                }
            });
        }

    });
});

let updateTotalProduct = function(type, quantity, product) {
        let count = parseInt(quantity);
        if (type !== 'import') {
            count = count * -1;
        }
        Product.findOneAndUpdate({ _id: product._id }, { $inc: { quantity: count } }, function(err, data) {
            if (err) {
                console.log(err);
            }
        });
    }
    // END IMPORT EXPORT PRODUCT TO STORAGE



module.exports = router;