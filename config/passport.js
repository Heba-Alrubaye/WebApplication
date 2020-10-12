var GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('../mongodb');
const User = db.User;

module.exports = function (passport) {
    passport.use(
        new GoogleStrategy({
            clientID: '919990039039-ui1t64c6gs8bqu3ef232ke9tk5oujg5b.apps.googleusercontent.com',
            clientSecret: '8RS6ehnhuS6aB-ZIEDUq8hOX',
            callbackURL: '/google/redirect'
        }, (accessToken, refreshToken, profile, done) => {
            let email = profile.emails[0].value;
            // let password = null;
            // Check if user exists, if not, then create a user
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
