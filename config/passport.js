var GoogleStrategy = require('passport-google-oauth20').Strategy;
const config = require('../config/config');
const db = require('../mongodb');
const User = db.User;

module.exports = function (passport) {
    passport.use(
        new GoogleStrategy({
            clientID: config.google.clientID,
            clientSecret: config.google.clientSecret,
            callbackURL: '/google/redirect'
        }, (accessToken, refreshToken, profile, done) => {
            let email = profile.emails[0].value;
            // check if the user exists otherwise create a user
            User.findOne({
                email: email
            }, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    user = new User({
                        email: email,
                        google: true
                    });
                    user.save(function (err) {
                        if (err) console.log(err);
                        return done(err, user);
                    });
                } else {
                    user.google = true;
                    user.save(function (err) {
                        if (err) console.log(err);
                        return done(err, user);
                    });
                }
            })
        })
    );

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id)
            .then(user => {
                done(null, user)
            }).catch(err => {
                console.log(err)
            })
    });
};
