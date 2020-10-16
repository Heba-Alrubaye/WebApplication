var express = require('express');
var path = require('path');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);

const isAuth = require('./middleware/is-auth');

require('./config/passport')(passport);

var app = express();
const db = require('./config/mongodb');


// ejs
app.set('view engine', 'ejs');

// app.set('views', __dirname + "/views");
// app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/')); // TODO: could be a security issue

// body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(session({
    secret: 'OUR SECRET',
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection }), // for storing the session in the database @nikisha
    cookie: { maxAge: 120 * 60 * 1000 } // this is for expiry of the session eg 2 hours if the user has not logged out @nikisha
}));

app.use(passport.initialize());
app.use(passport.session());

// routes
app.use('/', require('./routes/index'));
app.use('/', require('./routes/users'));
app.use('/', require('./routes/product'));

/**
 * setting the port number that the website will run on. In this case it is 8000.
 */
var port = process.env.PORT || 8000;
console.log("Running on port: " + port);
app.listen(port);
