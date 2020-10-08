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
const User = db.User;
const Product = db.Product;
const Cart = db.Cart;

var urlencode = bodyParser.urlencoded({ extended: false });

const username = "admin";
const password = "BiINPxSnYq4ygeRf";

const debug = true;

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

//setting the secret for the session.
app.use(session({ secret: 'OUR SECRET' }));

/**
 * get method for the add product page.
 */
app.get('/add-product', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'views', 'AddProduct.html'));
    // res.sendFile(path.join(__dirname, 'views', '/cart'));
});




/**
 * Get method for products. 
 * This method gets the products from the products collection, so it can be 
 * displayed on the home page.
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
 * Creates the product and adds it to the cart collection in mongodb.
 */
app.post('/add-cart',  (req, res, next) => {
    console.log('it entered post');
    const { name, price } = req.body;

    var cartProductBody = req.body;
    const cartProduct = new Cart(cartProductBody); // this is modal object.
    console.log("cart product created");

    cartProduct.save()
        .then((cartProductBody) => {
            console.log(cartProductBody);
            console.log("cart product saved");
 
        })
        .catch((err) => {
            console.log(err);
        })
    res.sendFile(path.join(__dirname, 'views', 'HomePage.html'));


});


/**
 * Get method for cart products. 
 * This method gets the products from the cart collection, so it can be 
 * displayed on the cart page.
 */
app.get('/cart', async (req, res, next) => {
    console.log('get cart products');

    Cart.find({}).then(cartProductBody => {

        //console.log(productBody);
        res.render("Cart.ejs", {carts: cartProductBody});
    })
});


/**
 * delete method for cart products. 
 * This method deletes the product off the cart page as well as the 
 * cart collection in mongodb.
 */
app.delete('/cart/:id', (req, res, next) => {
    console.log("delete called");
    let prod = { _id: req.params.id }

    console.log("Delete " + prod._id);
    Cart.deleteOne(prod, function (err) {
        if (err) {
            console.log(err);
        }
        console.log('Cart product has been deleted!');
        req.method = "GET";
        // res.sendFile(path.join(__dirname, '/cart'));
        res.sendFile(path.join(__dirname, 'views', 'Cart.html'));


    });
});



/**
  * Get method for products. 
 * This method gets the products from the products collection, so it can be 
 * displayed on the admin page.
 */
app.get('/admin-products', async (req, res, next) => {
    console.log('get products');

    Product.find({}).then(productBody => {

        //console.log(productBody);
        
        res.render("AdminProducts.ejs", {products: productBody});
    })
})


/**
 * delete method for admin products. 
 * This method deletes the product off the admin page as well as the 
 * products collection in mongodb.
 */
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
        // req.session.cartProduct = cart.cartProduct;  
        res.sendFile(path.join(__dirname, '/admin-products'));

    });
});

/**
 * 
 */
app.delete('/home-product/:id', (req, res, next) => {
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
 * Update product.
 * This method will update the selected product in a seperate page
 * and it will then update it in the products collection in mongodb.
 * The update will be shown on the page.
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


    res.redirect("/admin-products");

});


/**
 * Get the admin products page.
 */
app.get('/admin-products', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'views', 'AdminProducts.html'))
});


/**
 * get the home page.
 */
app.get('/home-product', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'views', 'HomePage.html'));
    // res.sendFile(path.join(__dirname, 'views', '/cart'));
});


/**
 * get the cart page.
 */
app.get('/cart', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'views', 'Cart.html'))
});


/**
 * get the edit page for the selected product.
 */
app.get('/edit/:id', (req, res, next) => {
    let id = req.params.id;
    res.render("Edit.ejs", {id: id});
});


/**
 * direct to the home page when the user has logged in.
 */
app.get('/', (req, res, next) => {
    if (req.session.loggedin) {
        console.log("User " + req.session.email + " is logged in!");
    } else {
        console.log("User is not logged in!");
    }
    res.sendFile(path.join(__dirname, 'views', 'Login.html')); //HomePage.html
});


/**
 * create a user in the register page and it will be created 
 * in the user collection in mongodb.
 */
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


/**
 * get the login page information. This method will check if 
 * the user is stored in the database or not.
 */
app.get('/login', (req, res, next) => {
    if (req.session.loggedin) {
        console.log("Already logged in as " + req.session.email + "!");
        return res.status(400).json({ message: "Already logged in as " + req.session.email + "!" });

    }
    res.sendFile(path.join(__dirname, 'views', 'Login.html'))
});


/**
 * This method will create a session with the login 
 * information if that user exists in the database.
 */
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


/**
 * get method for the reset password page.
 */
app.get('/reset', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'views', 'ResetPassword.html'))
});


/**
 * post method for resetting the user's password. It will update it on the 
 * user collection in the database to replace the previous password with this new one.
 */
app.post('/reset', function (req, res, next) {
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
 * get method for resetting the password.
 */
app.get('/reset/:token', function (req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
        if (!user) {
            res.status(404).end('Password reset token is invalid or has expired.');
            if (debug) console.log("Password reset token was invalid or has expired");
            return;
        }
        res.sendFile(path.join(__dirname, 'views', 'ChangePassword.html'))
    });
});


/**
 * 
 */
app.post('/reset/:token', function (req, res) {
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
                res.redirect('/login');
            });
        }
    ]);
});


/**
 * this method will log the user our of the 
 * website and the session they are in.
 */
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return console.log(err);
        }
        console.log("User logged out!");
        res.redirect('/');
    });
});


/**
 * get method for orders page.
 */
app.get('/orders', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'views', 'Orders.html'))
});


/**
 * get method for the register page.
 */
app.get('/register', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'views', 'Signup.html'))
});

/**
 * setting the port number that the website will run on. In this case it is 8000.
 */
var port = process.env.PORT || 8000;
console.log("Running on port: " + port);
app.listen(port);
