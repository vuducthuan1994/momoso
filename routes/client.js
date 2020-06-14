const express = require('express');
let router = express.Router();


const homeController = require('./client/home.js');

router.use('/', homeController);


module.exports = router;