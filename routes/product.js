var express = require('express');
var router = express.Router();

var path = require('path');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);

const isAuth = require('../middleware/is-auth');

require('../config/passport')(passport);

const db = require('../mongodb');
const Product = db.Product;
const Cart = db.Cart;

/**
 *Product page for where all the get, put, post, delete requests 
 are done to use in the application for adding in items, deleting items, 
 creating items and updating items. //Nikisha  
 */


/**
 * using sessions.
 */
router.use(session({
    secret: 'OUR SECRET',
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection }), // for storing the session in the database @nikisha
    cookie: { maxAge: 120 * 60 * 1000 } // this is for expiry of the session eg 2 hours if the user has not logged out @nikisha
}));

router.use(passport.initialize());
router.use(passport.session());

// routes
router.use('/', require('./index'));
router.use('/', require('./users'));
// app.use('/', require('./routes/product'));

/**
 * get method for the add product page.
 */
router.get('/add-product', isAuth.admin, (req, res, next) => {
    res.render('AddProduct', {admin: req.session.admin});
});

/**
 * Get method for products. 
 * This method gets the products from the products collection, so it can be 
 * displayed on the home page.
 */
router.get('/home-product', async (req, res, next) => {
    console.log('get products');

    Product.find({}).then(productBody => {
        console.log(productBody);
        res.render("HomePage", { products: productBody, loggedin: req.session.loggedin, admin: req.session.admin });
    })
})

/**
 * Creates the product and adds it to the product collection in mongodb.
 */
router.post('/add-product', isAuth.admin, (req, res, next) => {
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
    res.redirect("/home-product");
});

/**
 * Creates the product and adds it to the cart collection in mongodb.
 */
router.post('/add-cart', isAuth.user, (req, res, next) => {
    console.log('it entered post');
    const { name, price, description } = req.body;

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
    res.redirect("/home-product");
});

/**
 * Get method for cart products. 
 * This method gets the products from the cart collection, so it can be 
 * displayed on the cart page.
 */
router.get('/cart', isAuth.user, async (req, res, next) => {
    console.log('get cart products');

    Cart.find({}).then(cartProductBody => {
        //console.log(productBody);
        res.render("Cart", { carts: cartProductBody, user: req.session.user });
    })
});

/**
 * delete method for cart products. 
 * This method deletes the product off the cart page as well as the 
 * cart collection in mongodb.
 */
router.delete('/cart/:id', isAuth.user, (req, res, next) => {
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
router.get('/admin-products', isAuth.admin, async (req, res, next) => {
    console.log('get products');

    Product.find({}).then(productBody => {
        res.render("AdminProducts", { products: productBody, admin: req.session.admin });
    })
});

/**
 * get the details page for the selected product.
 */
// router.get('/details/:id', isAuth.user, (req, res, next) => {
//     // const id = req.params.id;
//     console.log("in details!!");
//     const name = req.params.name;
//     const price = req.params.price;
//     const description = req.params.description; 
//     res.render("Details", {name, price, description });
//     res.redirect("/details/:id");
// });

/**
 * delete method for admin products. 
 * This method deletes the product off the admin page as well as the 
 * products collection in mongodb.
 */
router.delete('/admin-products/:id', isAuth.admin, (req, res, next) => {
    console.log("delete called");
    let prod = { _id: req.params.id }


    console.log("Requested deletion of item " + prod._id);

    Product.deleteOne(prod, function (err) {
        if (err) {
            console.log(err);
        }
        console.log('Deleted item!');
        req.method = "GET";
        // res.direct('/admin-products');
        res.render("AdminProducts");
        // window.location.reload();


    });
});

/**
 * 
 */
router.delete('/home-product/:id', isAuth.admin, (req, res, next) => {
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
        // window.location.reload();

    });
});

/**
 * Update product.
 * This method will update the selected product in a seperate page
 * and it will then update it in the products collection in mongodb.
 * The update will be shown on the page.
 */
router.post('/edit/:id', isAuth.admin, async (req, res, next) => {
    console.log("Called edit PUT");
    var productBody = req.body;
    console.log(req.params.id);
    console.log(productBody);
    let prod = {
        name: productBody.name,
        price: productBody.price,
        description: productBody.description
    };

    Product.updateOne({ _id: req.params.id }, prod, function (err) {
        if (err) {
            console.log(err);
        }
        console.log('Product updated');
    });

    res.render("AdminProducts");
});


// router.get('/details/:id', isAuth.admin,(req, res, next) => {
//     console.log("inside put details");
// //const product = await 
//     Product.findOne({ _id: req.params.id }).then(product=>{
//         // if (err) {
//         //     console.log(err);
//         // }
//         console.log('Product found');
//         res.render("Details", {prodcut: product, user: req.session.user});
//     });
//     // res.render(product);

    
// });

router.get('/details/:id', isAuth.admin,(req, res, next) => {
    console.log("inside put details");
//const product = await 
    Product.findOne({ _id: req.params.id }, function(err, obj){
        if (err) {
            console.log(err);
        }else{
            console.log('Product found');
            console.log(obj);
            res.render("Details", obj);

            // res.render("Details", {prodcut: product, user: req.session.user});


        }
        res.render("Details", obj);

        // res.render("Details", {prodcut: product, user: req.session.user});
    });
    // res.render(product);
    // res.render("Details");

    
});

/**
 * Get the admin products page.
 */
router.get('/admin-products', isAuth.admin, (req, res, next) => {
    res.render("admin-products");
});

/**
 * Get the details of products .
 */
router.get('/details/:id',isAuth.user, (req, res, next) => {
    console.log("in details!!");
    let id = req.params.id;
    res.render("Details", { id: id });

    //  res.sendFile(path.join(__dirname, 'views', 'Details.ejs'))
 });

/**
 * get the cart page.
 */
router.get('/cart', isAuth.user, (req, res, next) => {
    res.render("cart");
});

/**
 * get the edit page for the selected product.
 */
router.get('/edit/:id', isAuth.admin, (req, res, next) => {
    let id = req.params.id;
    res.render("Edit", { id: id });
});

module.exports = router;