var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/userModel');
var bCrypt = require('bcrypt');

module.exports = function(passport) {

    passport.use('login', new LocalStrategy({
            passReqToCallback: true
        },
        function(req, account, password, done) {
            // check in mongo if a user with username exists or not
            User.findOne({ account: account },
                function(err, user) {
                    // In case of any error, return using the done method
                    if (err)
                        return done(err);
                    // Username does not exist, log the error and redirect back
                    if (!user) {
                        console.log('Tài khoản không tồn tại trong hệ thống ' + account);
                        return done(null, false, req.flash('message', 'Tài khoản không tồn tại'));
                    }
                    // User exists but wrong password, log the error 
                    if (!isValidPassword(user, password)) {
                        return done(null, false, req.flash('message', 'Sai mật khẩu')); // redirect back to login page
                    }
                    // If role of user is not admin , log the error . author : vuducthuan1994

                    if (!isValidRole(user, 'admin')) {
                        return done(null, false, req.flash('message', 'Tài khoản chưa được kích hoạt !')); // redirect back to login page
                    }
                    // User and password both match, return user from done method
                    // which will be treated like success
                    return done(null, user);
                }
            );

        }));



    var isValidPassword = function(user, password) {
        const result = bCrypt.compareSync(password, user.hash_password);
        return result;

    }

    var isValidRole = function(user, role) {
        if (user.role == role) {
            return true
        } else {
            return false
        }
    }

}