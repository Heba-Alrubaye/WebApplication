var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const db = require('./mongodb');
const User = db.User;

const username = "admin";
const password = "BiINPxSnYq4ygeRf";

const uri = `mongodb+srv://${username}:${password}@cluster0.7fsul.mongodb.net/shop`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect();

// mongoose.connect('mongodb+srv://${username}:${password}@cluster0.7fsul.mongodb.net/test')
// var db = mongoose.connection;

var app = express();

// app.use(express.static(__dirname + '/views'));
// app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/')); // TODO: could be a security issue

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}))

app.get('/add-product', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'views', 'AddProduct.html'))
});

app.get('/admin-products', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'views', 'AdminProducts.html'))
});

app.get('/cart', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'views', 'Cart.html'))
});

app.get('/edit', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'views', 'Edit.html'))
});

app.get('/', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'views', 'HomePage.html'));
});

app.post('/register', (req, res, next) => {
    var userBody = req.body;

    User.countDocuments({ email: userBody.email }, async function (err, count) {
        if (count > 0) console.log("user already exist!")
        else {
            console.log("creating user");

            const user = new User(userBody);
            console.log("user created");

            const hash = bcrypt.hashSync(userBody.password, 10);
            console.log("hashed password");

            user.hash = hash;
            console.log("added has to user");

            user.save();
            console.log("user saved");
        }
    })

    res.sendFile(path.join(__dirname, 'views', 'Login.html'));

    // const shop = client.db('shop');
    // const users = shop.collection('users');
    // users.insertOne(user, (err, result) => {
    //     console.log('success');
    // })
});

app.get('/login', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'views', 'Login.html'))
});

app.post('/login', async (req, res, next) => {
    var userBody = req.body;
    const username = userBody.email;
    const password = userBody.password;

    console.log('email: ' + username + ' password: ' + password);

    const user = await User.findOne({ email: username });
    if (!user) {
        console.log('user doesn\'t exist!');
        return;
    } else {
        console.log('user name: ' + user.email + 'found in DB');
    }
    console.log('checking password');
    if (bcrypt.compareSync(password, user.hash)) {
        console.log('password matches');
        // TODO: session
        //const token = jwt.sign({ sub: user.id }, config.secret, { expiresIn: '7d' });
        return {
            ...user.toJSON(),
            //token
        };
    } else {
        console.log('password doesn\'t match');
    }
});

app.get('/orders', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'views', 'Orders.html'))
});

app.get('/register', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'views', 'Signup.html'))
});

var port = process.env.PORT || 8000;
console.log("Running on port: " + port);
app.listen(port);

// var createError = require('http-errors');
// var express = require('express');
// var path = require('path');
// var cookieParser = require('cookie-parser');
// var logger = require('morgan');

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
// var authenticationRouter = require('./routes/authentication');

// var app = express();

// // view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

// app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);
// app.use('/login', authenticationRouter);

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

// module.exports = app;
