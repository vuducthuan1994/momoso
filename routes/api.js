const express = require('express');
let router = express.Router();
const Subscribe = require('../models/subscribeModel');


router.post('/subscribe', function(req, res) {
    Subscribe.create(req.body, function(err, data) {
        if (!err) {
            res.json({
                success: true
            });
        } else {
            res.json({
                success: false
            });
        }
    })
});


module.exports = router;