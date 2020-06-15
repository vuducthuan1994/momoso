const express = require('express');
const Settings = require('../models/settingModel');
let router = express.Router();
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: process.env.CACHE_TIME });

router.get('/', async function(req, res) {
    let general = await getGeneralConfig();
    console.log(general);
    res.render('client/index', {
        title: "Sửa Thông Tin Kho Hàng",
        layout: 'client.hbs',
        general: general
    });
});

router.get('/about-us', async function(req, res) {
    let general = await getGeneralConfig();
    res.render('client/about-us', {
        title: "About US",
        layout: 'client.hbs',
        general: general
    });
});

let getGeneralConfig = function() {
    return new Promise(function(resolve, reject) {
        let general = cache.get("general");
        if (general == undefined) {
            Settings.findOne({ type: 'general' }, function(err, general) {
                if (!err) {
                    resolve(general.content);
                    cache.set("general", general.content);
                }
            });
        } else {
            resolve(general)
        }
    });
}


module.exports = router;