var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/userModel');
var bCrypt = require('bcrypt');


module.exports = function(passport) {

    passport.use('signup', new LocalStrategy({
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) {

            findOrCreateUser = function() {
                // find a user in Mongo with provided username
                User.findOne({ 'account': username }, function(err, user) {
                    // In case of any error, return using the done method
                    if (err) {
                        console.log('Error in SignUp: ' + err);
                        return done(err);
                    }
                    // already exists
                    if (user) {
                        console.log('User already exists with username: ' + username);
                        return done(null, false, req.flash('message', 'Tài khoản đã tồn tại'));
                    } else {
                        // if there is no user with that email
                        // create the user
                        var newUser = new User();

                        // set the user's local credentials
                        newUser.account = username;
                        newUser.hash_password = createHash(password);
                        newUser.email = req.body.email;

                        // save the user
                        newUser.save(function(err) {
                            if (err) {
                                console.log('Error in Saving user: ' + err);
                                throw err;
                            }
                            console.log('User Registration succesful');
                            return done(null, newUser, req.flash('success', 'Đăng ký thành công ! Vui lòng liên hệ admin'));
                        });
                    }
                });
            };
            // Delay the execution of findOrCreateUser and execute the method
            // in the next tick of the event loop
            process.nextTick(findOrCreateUser);
        }));

    // Generates hash using bCrypt
    var createHash = function(password) {
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    }

}