const express = require('express');
const app = express();
const mongoose = require('mongoose');


var cookieParser = require('cookie-parser');
require('dotenv').config()
var expressHbs = require('express-handlebars');
var path = require('path');
TZ = "Asia/Ho_Chi_Minh";

var bodyParser = require('body-parser');

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));



app.use(cookieParser());
global.__basedir = __dirname;

const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: process.env.CACHE_TIME });

mongoose.connect(process.env.DB_URL, {
    user: process.env.DB_USER,
    pass: process.env.DB_PASSWORD,
    useUnifiedTopology: true,
    useNewUrlParser: true
}); // connect to database

// https
app.enable('trust proxy');
//Serves static files (we need it to import a css file)
app.use(express.static('public'));
app.use(express.static('adminTheme'));
app.use(express.static('clientTheme'));
// view engine setup
app.engine('.hbs', expressHbs({
    defaultLayout: 'layout',
    partialsDir: "views/partials/",
    extname: '.hbs',
    helpers: require('./helper/Helper')
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
// done engine setup






// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = process.env.ENV == 'DEV' ? err : {};
    // render the error page
    res.render('error');
});

// Configuring Passport
var passport = require('passport');
var expressSession = require('express-session');
// TODO - Why Do we need this key ?
app.use(expressSession({
    secret: 'mySecretKey',
    cookie: {
        maxAge: 1000 * 60 * 30 //đơn vị là milisecond / thoi gian de login lai
    }

}));
app.use(passport.initialize());
app.use(passport.session());

// Using the flash middleware provided by connect-flash to store messages in session
// and displaying in templates
var flash = require('connect-flash');
app.use(flash());

// Initialize Passport
var initPassport = require('./passport/init');
initPassport(passport);

var auth = require('./routes/auth')(passport);
var admin = require('./routes/admin')(cache);
var client = require('./routes/client');
var api = require('./routes/api');
app.use('/', client);
app.use('/admin', admin);
app.use('/api', api);
app.use('/', auth);


// Moi request voi route ko dinh nghia tro ve trang chu
// app.get('/*', function(req, res) {
//     res.redirect('/');
// });

app.listen(process.env.PORT || 4300);