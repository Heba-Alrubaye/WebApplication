var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
// var cookieParser = require('cookie-parser');
var session = require('express-session')
var mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
var async = require('async');
var nodemailer = require('nodemailer');
var crypto = require('crypto');

const db = require('./mongodb');
// const Products = require('./product.model');
const User = db.User;
const Product = db.Product;
var urlencode = bodyParser.urlencoded({ extended: false });
// const productCollection = db.collection('products')

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

app.use(session({ secret: 'OUR SECRET' }));

app.get('/add-product', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'views', 'AddProduct.html'));
    // res.sendFile(path.join(__dirname, 'views', '/cart'));
});




/**
 * Get method for products.
 */
app.get('/home-product', async (req, res, next) => {
    console.log('get products');

    Product.find({}).then(productBody => {

        console.log(productBody);
        res.render("HomePage.ejs", {products: productBody});
    })
})
/**
 * Creates the product and adds it to the product collection in mongodb.
 */
app.post('/add-product', (req, res, next) => {
    console.log('it entered post');
    var productBody = req.body;
    const product = new Product(productBody); // this is modal object.
    console.log("product created");
    product.save()
        .then((productBody) => {
            console.log(productBody);
            console.log("product saved");
            //res.redirect('/');
        })
        .catch((err) => {
            console.log(err);
        })
    res.sendFile(path.join(__dirname, 'views', 'AddProduct.html'));
    res.sendFile(path.join(__dirname, 'views', 'HomePage.html'));

});

/**
 * Get method for products.
 */
app.get('/cart', async (req, res, next) => {
    console.log('get products');

    Product.find({}).then(productBody => {

        //console.log(productBody);
        res.render("Cart.ejs", {products: productBody});
    })
});

/**
 * Get method for products.
 */
app.get('/admin-products', async (req, res, next) => {
    console.log('get products');

    Product.find({}).then(productBody => {

        //console.log(productBody);
        res.render("AdminProducts.ejs", {products: productBody});
    })
})

app.delete('/admin-products/:id', (req, res, next) => {
    console.log("delete called");
    let prod = { _id: req.params.id }

    console.log("Requested deletion of item " + prod._id);

    Product.deleteOne(prod, function (err) {
        if (err) {
            console.log(err);
        }
        console.log('Deleted item!');
        req.method = "GET";
        // res.redirect("/admin-products");
        res.sendFile(path.join(__dirname, '/admin-products'));

    });
});

// app.delete('/cart/:id', (req, res, next) => {
//     console.log("delete called");
//     let prod = { _id: req.params.id }

//     console.log("Requested deletion of item " + prod._id);

//     Product.deleteOne(prod, function (err) {
//         if (err) {
//             console.log(err);
//         }
//         console.log('Deleted item!');
//         req.method = "GET";
//         // res.redirect("/admin-products");
//         res.sendFile(path.join(__dirname, '/cart'));

//     });
// });

app.delete('/home-prdouct/:id', (req, res, next) => {
    console.log("delete called");
    let prod = { _id: req.params.id }

    console.log("Requested deletion of item " + prod._id);

    Product.deleteOne(prod, function (err) {
        if (err) {
            console.log(err);
        }
        console.log('Deleted item!');
        req.method = "GET";
        // res.redirect("/admin-products");
        res.sendFile(path.join(__dirname, '/home-product'));

    });
});

/**
 * Update product
 */
app.delete('/cart/:id', async (req, res, next) => {
    console.log("Called cart PUT");
    var productBody = req.body;
    console.log(req.params.id);
    console.log(productBody);
    let prod = {
         name: productBody.name, 
         price: productBody.price
    };

    Product.deleteOne({_id: req.params.id}, prod, function (err) {
        if (err) {
            console.log(err);
        }
        console.log('Product updated');
    });

    
    // Products.findOneAndUpdate({
    //     // id = req.body.id,
    //     name = req.body.name,
    //     price = req.body.prices

    // }).then(product =>{
    //     console.log("updated!");
    //     res.json(product)
    // });

    res.redirect("/admin-products");

});

/**
 * Update product
 */
app.post('/edit/:id', async (req, res, next) => {
    console.log("Called edit PUT");
    var productBody = req.body;
    console.log(req.params.id);
    console.log(productBody);
    let prod = {
         name: productBody.name, 
         price: productBody.price
    };

    Product.updateOne({_id: req.params.id}, prod, function (err) {
        if (err) {
            console.log(err);
        }
        console.log('Product updated');
    });

    
    // Products.findOneAndUpdate({
    //     // id = req.body.id,
    //     name = req.body.name,
    //     price = req.body.prices

    // }).then(product =>{
    //     console.log("updated!");
    //     res.json(product)
    // });

    res.redirect("/admin-products");

});

app.get('/admin-products', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'views', 'AdminProducts.html'))
});

app.get('/home-product', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'views', 'HomePage.html'));
    // res.sendFile(path.join(__dirname, 'views', '/cart'));
});

app.get('/cart', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'views', 'Cart.html'))
});

app.get('/edit/:id', (req, res, next) => {
    let id = req.params.id;
    res.render("Edit.ejs", {id: id});
});

app.get('/', (req, res, next) => {
    if (req.session.loggedin) {
        console.log("User " + req.session.email + " is logged in!");
    } else {
        console.log("User is not logged in!");
    }
    res.sendFile(path.join(__dirname, 'views', 'HomePage.html')); //HomePage.html
});

app.post('/register', (req, res, next) => {
    var userBody = req.body;
    console.log(userBody);

    User.countDocuments({ email: userBody.email }, async function (err, count) {
        try {
            if (count > 0) console.log("user already exist!")
            else {
                console.log("creating user");

                const user = new User(userBody);
                console.log("user created");

                console.log(userBody.email);
                const hash = bcrypt.hashSync(userBody.password, 10);
                console.log("hashed password");

                user.hash = hash;
                console.log("added has to user");

                user.save();
                console.log("user saved");
            }
        } catch (err) {
            console.error(err);
        }

    })

    res.sendFile(path.join(__dirname, 'views', 'Login.html'));
});

app.get('/login', (req, res, next) => {
    if (req.session.loggedin) {
        console.log("Already logged in as " + req.session.email + "!");
        return res.status(400).json({ message: "Already logged in as " + req.session.email + "!" });

    }
    res.sendFile(path.join(__dirname, 'views', 'Login.html'))
});

app.post('/login', async (req, res, next) => {
    var userBody = req.body;
    const username = userBody.email;
    const password = userBody.password;

    console.log('email: ' + username + ' password: ' + password);

    const user = await User.findOne({ 'email': { $in: [username] } }); // prevents NOSQL injection
    if (!user) {
        console.log('user doesn\'t exist!');
        return;
    } else {
        console.log('user name: ' + user.email + 'found in DB');
    }
    console.log('checking password');
    if (bcrypt.compareSync(password, user.hash)) {
        console.log('password matches');
        const token = jwt.sign({ sub: user.id }, "placeholder secret", { expiresIn: '7d' });
        console.log(token);
        req.session.loggedin = true;
        req.session.email = user.email;
        console.log("User logged in: " + req.session.loggedin);
        res.redirect("/");
        // addProd;
    } else {
        console.log('password doesn\'t match');
    }
});

app.get('/forgot', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'views', 'ResetPassword.html'))
});

app.post('/forgot', function (req, res, next) {
    async.waterfall([
        function (done) {
            crypto.randomBytes(20, function (err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function (token, done) {
            User.findOne({ email: req.body.email }, function (err, user) {
                // if (!user) {
                //     req.flash('error', 'No account with that email address exists.');
                //     return res.redirect('/forgot');
                // }
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                console.log("saved")
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
            smtpTransport.sendMail(mailOptions, function (err) {
                req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                done(err, 'done');
            });
        }
    ], function (err) {
        if (err) return next(err);
        res.redirect('/forgot');
    });
});

app.get('/reset/:token', function (req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
        // if (!user) {
        //     req.flash('error', 'Password reset token is invalid or has expired.');
        //     return res.redirect('/reset');
        // }
        res.render('game', {token: req.params.token})
        // res.sendFile(path.join(__dirname, 'views', 'ChangePassword.html'))
    });
});

app.post('/reset/:token', function (req, res) {
    async.waterfall([
        function (done) {
            console.log(req.params.token)
            User.findOne({ resetPasswordToken: req.params.token }, function (err, user) { //  resetPasswordExpires: { $gt: Date.now() }
                // if (!user) {
                //   req.flash('error', 'Password reset token is invalid or has expired.');
                //   return res.redirect('back');
                // }
                console.log(user)
                console.log(req.body.password);
                const hash = bcrypt.hashSync(req.body.password, 10);
                console.log(hash);
                user.hash = hash;
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;

                user.save();

                // user.save(function (err) {
                //     req.logIn(user, function (err) {
                //         done(err, user);
                //     });
                // });
            });
        }
    ], function (err) {
        res.redirect('/');
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return console.log(err);
        }
        console.log("User logged out!");
        res.redirect('/');
    });
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
