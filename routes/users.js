var express = require('express');
var router = express.Router();

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
var async = require('async');
var nodemailer = require('nodemailer');
var crypto = require('crypto');

const db = require('../mongodb');
const User = db.User;

const debug = true;

const session = require('express-session')
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);

router.use(session({
  secret: 'OUR SECRET',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection }), // for storing the session in the database
  cookie: { secure: false, maxAge: 120 * 60 * 1000 } // this is for expiry of the session eg 2 hours if the user has not logged out
}));

/**
 * Get method for the register page.
 */
router.get('/register', (req, res, next) => {
  res.render('register');
});

/**
 * Create a user and put the user collection in mongodb.
 * @author Heba
 */
router.post('/register', (req, res, next) => {
  var userBody = req.body;

  User.countDocuments({ email: userBody.email }, async function (err, count) {
    try {
      if (count > 0) {
        if (debug) console.log("That email already exists!")
      }
      else {
        const user = new User(userBody);
        if (debug) console.log("Email: " + userBody.email);
        const hash = bcrypt.hashSync(userBody.password, 10); // salt
        user.hash = hash;
        if (debug) console.log("Hash: " + user.hash);
        user.save();
      }
    } catch (err) {
      console.error(err);
    }
  })
  res.render('login');
});

/**
 * Get the login page information. This method will check if the user is already logged in or not.
 * @author Heba
 */
router.get('/login', (req, res, next) => {
  if (req.session.loggedin) {
    if (debug) console.log("Already logged in as " + req.session.email + "!");
    return res.status(400).json({ message: "Already logged in as " + req.session.email + "!" });
  }
  res.render('login');
});

/**
 * Post login method which will create a session with the login information if that user exists in the database.
 * @author Heba
 */
router.post('/login', async (req, res, next) => {
  var userBody = req.body;
  const username = userBody.email;
  const password = userBody.password;

  const user = await User.findOne({ 'email': { $in: [username] } }); // prevents NOSQL injection
  if (!user) {
    if (debug) console.log('Invalid user!');
    return;
  } else {
    if (debug) console.log(user.email + ' found in mongodb');
  }
  if (bcrypt.compareSync(password, user.hash)) {
    const token = jwt.sign({ sub: user.id }, "placeholder secret", { expiresIn: '7d' });
    if (debug) console.log("Token: " + token);
    req.session.loggedin = true;
    req.session.email = user.email;
    if (debug) console.log("User logged in: " + req.session.loggedin);
    res.render('homepage');
  } else {
    if (debug) console.log('Invalid password!');
  }
});

/**
 * Get method for the reset password page.
 */
router.get('/reset', (req, res, next) => {
  res.render('reset');
});

/**
 * Post method for resetting the user's password. Sends a reset password email to the given address if it exists.
 * @author Toby
 */
router.post('/reset', function (req, res, next) {
  async.waterfall([
    function (done) {
      crypto.randomBytes(20, function (err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function (token, done) {
      User.findOne({ email: req.body.email }, function (err, user) {
        if (!user) {
          res.status(404).end('That email address cannot be found.');
          if (debug) console.log("Email address does not exist.");
          return;
        }
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        if (debug) {
          console.log("Token: " + user.resetPasswordToken);
          console.log("Expires: " + user.resetPasswordExpires);
        }

        user.save(function (err) {
          done(err, token, user);
        });
      });
    },
    function (token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
          user: 'nwen304groupproject@gmail.com',
          pass: "qGDq6njmdUxWS72H"
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      var mailOptions = {
        from: '"NWEN304 Group Project" <nwen304groupproject@gmail.com>', // sender address
        to: user.email, // list of receivers
        subject: 'Password Reset', // subject line
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n' // plain text body
      };
      smtpTransport.sendMail(mailOptions);
      res.status(201).end('An e-mail has been sent to ' + user.email + ' with further instructions.');
      if (debug) console.log("Password reset email sent to " + user.email);
    }
  ]);
});

/**
 * Get method for resetting the password.
 * @author Toby
 */
router.get('/reset/:token', function (req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
    if (!user) {
      res.status(404).end('Password reset token is invalid or has expired.');
      if (debug) console.log("Password reset token was invalid or has expired");
      return;
    }
    res.render('changepassword');
  });
});

/**
 * Post method for resetting the password. It will update it on the user collection in the database to replace the previous password with this new one.
 * @author Toby
 */
router.post('/reset/:token', function (req, res) {
  async.waterfall([
    function (done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
        if (!user) {
          res.status(404).end('Password reset token is invalid or has expired.');
          if (debug) console.log("Password reset token was invalid or has expired");
          return;
        }
        const hash = bcrypt.hashSync(req.body.password, 10);
        if (debug) console.log("Hash: " + hash);

        user.hash = hash;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        user.save();
        res.render('login');
      });
    }
  ]);
});

/**
 * Get method to logout the user out of the website and the delete the session.
 * @author Heba
 */
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return console.log(err);
    }
    if (debug) console.log("User logged out!");
    res.render('login');
  });
});

module.exports = router;
