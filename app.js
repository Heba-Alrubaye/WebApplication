var express = require('express');
var path = require('path');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);

const isAuth = require('./middleware/is-auth');

require('./config/passport')(passport);

var app = express();
const db = require('./mongodb');
const Product = db.Product;
const Cart = db.Cart;

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
    store: new MongoStore({ mongooseConnection: mongoose.connection }), // for storing the session in the database
    cookie: { maxAge: 120 * 60 * 1000 } // this is for expiry of the session eg 2 hours if the user has not logged out
}));

app.use(passport.initialize());
app.use(passport.session());

// routes
app.use('/', require('./routes/index'));
app.use('/', require('./routes/users'));

/**
 * get method for the add product page.
 */
app.get('/add-product', isAuth.admin, (req, res, next) => {
    res.render('addproduct');
});

/**
 * Get method for products. 
 * This method gets the products from the products collection, so it can be 
 * displayed on the home page.
 */
app.get('/home-product', isAuth.user, async (req, res, next) => {
    console.log('get products');

    Product.find({}).then(productBody => {
        console.log(productBody);
        res.render("HomePage", { products: productBody });
    })
})

/**
 * Creates the product and adds it to the product collection in mongodb.
 */
app.post('/add-product', isAuth.admin, (req, res, next) => {
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
    res.render("HomePage");
});

/**
 * Creates the product and adds it to the cart collection in mongodb.
 */
app.post('/add-cart', isAuth.user, (req, res, next) => {
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
    res.render("HomePage");
});

/**
 * Get method for cart products. 
 * This method gets the products from the cart collection, so it can be 
 * displayed on the cart page.
 */
app.get('/cart', isAuth.user, async (req, res, next) => {
    console.log('get cart products');

    Cart.find({}).then(cartProductBody => {
        //console.log(productBody);
        res.render("Cart", { carts: cartProductBody });
    })
});

/**
 * delete method for cart products. 
 * This method deletes the product off the cart page as well as the 
 * cart collection in mongodb.
 */
app.delete('/cart/:id', isAuth.user, (req, res, next) => {
    console.log("delete called");
    let prod = { _id: req.params.id }

    console.log("Delete " + prod._id);
    Cart.deleteOne(prod, function (err) {
        if (err) {
            console.log(err);
        }
        console.log('Cart product has been deleted!');
        req.method = "GET";
        res.render("Cart");
    });
});

/**
  * Get method for products. 
 * This method gets the products from the products collection, so it can be 
 * displayed on the admin page.
 */
app.get('/admin-products', isAuth.admin, async (req, res, next) => {
    console.log('get products');

    Product.find({}).then(productBody => {
        res.render("AdminProducts", { products: productBody });
    })
});

/**
 * get the details page for the selected product.
 */
app.get('/details/:id', isAuth.user, (req, res, next) => {
    let id = req.params.id;
    res.render("Details", { id: id });
});

/**
 * delete method for admin products. 
 * This method deletes the product off the admin page as well as the 
 * products collection in mongodb.
 */
app.delete('/admin-products/:id', isAuth.admin, (req, res, next) => {
    console.log("delete called");
    let prod = { _id: req.params.id }


    console.log("Requested deletion of item " + prod._id);

    Product.deleteOne(prod, function (err) {
        if (err) {
            console.log(err);
        }
        console.log('Deleted item!');
        req.method = "GET";
        res.render("AdminProducts");

    });
});

/**
 * 
 */
app.delete('/home-product/:id', isAuth.admin, (req, res, next) => {
    console.log("delete called");
    let prod = { _id: req.params.id }

    console.log("Requested deletion of item " + prod._id);

    Product.deleteOne(prod, function (err) {
        if (err) {
            console.log(err);
        }
        console.log('Deleted item!');
        req.method = "GET";
        res.render("AdminProducts");

    });
});

/**
 * Update product.
 * This method will update the selected product in a seperate page
 * and it will then update it in the products collection in mongodb.
 * The update will be shown on the page.
 */
app.post('/edit/:id', isAuth.admin, async (req, res, next) => {
    console.log("Called edit PUT");
    var productBody = req.body;
    console.log(req.params.id);
    console.log(productBody);
    let prod = {
        name: productBody.name,
        price: productBody.price
    };

    Product.updateOne({ _id: req.params.id }, prod, function (err) {
        if (err) {
            console.log(err);
        }
        console.log('Product updated');
    });

    res.render("AdminProducts");
});

/**
 * Get the admin products page.
 */
app.get('/admin-products', isAuth.admin, (req, res, next) => {
    res.render("admin-products");
});

/**
 * Get the details of products page.
 */
// app.get('/details', (req, res, next) => {
//     res.sendFile(path.join(__dirname, 'views', 'Details.html'))
// });

/**
 * get the home page.
 */
app.get('/home-product', isAuth.user, (req, res, next) => {
    res.render("homepage");
});

/**
 * get the cart page.
 */
app.get('/cart', isAuth.user, (req, res, next) => {
    res.render("cart");
});

/**
 * get the edit page for the selected product.
 */
app.get('/edit/:id', isAuth.admin, (req, res, next) => {
    let id = req.params.id;
    res.render("Edit", { id: id });
});

// /**
//  * direct to the home page when the user has logged in.
//  */
// app.get('/', (req, res, next) => {
//     if (req.session.loggedin) {
//         console.log("User " + req.session.email + " is logged in!");
//         res.render("HomePage");
//     } else {
//         console.log("User is not logged in!");
//         res.render("Login");
//     }
// });

/**
 * get method for orders page.
 */
app.get('/orders', isAuth.user, (req, res, next) => {
    res.render("orders");
});

/**
 * setting the port number that the website will run on. In this case it is 8000.
 */
var port = process.env.PORT || 8000;
console.log("Running on port: " + port);
app.listen(port);
