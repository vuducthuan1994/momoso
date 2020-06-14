const express = require('express');
let router = express.Router();


const homeController = require('./client/home.js');
const aboutUsController = require('./client/about-us.js');
router.use('/', homeController);
router.use('/about-us', aboutUsController);

module.exports = router;