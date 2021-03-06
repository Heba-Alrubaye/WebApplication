var express = require('express');
var router = express.Router();

const http = require("http");
const https = require("https");
const fetch = require("node-fetch")

const isAuth = require('../middleware/is-auth');

const db = require('../config/mongodb');
const Product = db.Product;
const Cart = db.Cart;
const User = db.User;

const debug = false;

/**
 * Product page for where all the get, put, post, delete requests are done to use in the application
 * for adding in items, deleting items, creating items and updating items.
 * @author Nikisha  
 */

/**
 * Get method for products. This method gets the products from the products collection, so it can be displayed on the home page.
 * @author Nikisha & Heba
 */
router.get('/home-product', async (req, res, next) => {
    fetch(req.protocol + '://' + req.get('host') + '/api/products')
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            res.render("HomePage", { products: data.products, loggedin: req.session.loggedin, admin: req.session.admin });
        });
})

/**
 * Get details page for the selected product.
 * @author Nikisha
 */
router.get('/details/:id', (req, res, next) => {
    Product.findOne({ _id: req.params.id }, function (err, proddetail) {
        if (err) {
            console.log(err);
        } else {
            var product = proddetail;
            res.render("Details", { product: product, loggedin: req.session.loggedin, admin: req.session.admin }); // products: obj
        }
    });
});

/**
 * Creates the product and adds it to the cart collection in mongodb.
 * @author Nikisha
 */
router.post('/add-cart', isAuth.user, async (req, res, next) => {
    var cartProds = [];
    const user = await User.findOne({ 'email': { $in: [req.session.email] } });

    if (!user) return res.redirect('/login');

    const cart = await Cart.findOne({ userId: user._id.toString() });
    const product = await Product.findOne({ _id: req.body.productToken })

    if (!cart) {
        Cart.create({
            userId: user._id,
            cartProds: [{ name: product.name, price: product.price }]
        });
    } else {
        cart.cartProds.push({
            name: product.name,
            price: product.price
        });
        Cart.updateOne({
            _id: cart._id,
            userId: user._id,
            cartProds: cart.cartProds
        }, (err) => {
            if (err) throw err;
            res.redirect('/home-product')
        });
    }
});

/**
 * Get method for cart products. 
 * This method gets the products from the cart collection, so it can be 
 * displayed on the cart page.
 * @author Nikisha
 */
router.get('/cart', isAuth.user, async (req, res, next) => {
    const cart = await Cart.findOne({ userid: req.session.user });
    res.render("Cart", { carts: cart.cartProds, admin: req.session.admin })
});

/**
 * Delete method for cart products. This method deletes the product off the cart page as well as the cart collection in mongodb.
 * @author Nikisha
 */
router.delete('/cart/:id', isAuth.user, (req, res, next) => {
    let prod = { _id: req.params.id }

    Cart.deleteOne(prod, function (err) {
        if (err) {
            console.log(err);
        }
        if (debug) console.log('Product has been deleted from the cart');
        req.method = "GET";
        res.render("Cart");
    });
});

/**
 * Get method for the add product page.
 * @author Nikisha
 */
router.get('/add-product', isAuth.admin, (req, res, next) => {
    res.render('AddProduct');
});

/**
 * Creates the product and adds it to the product collection in mongodb.
 * @author Nikisha
 */
router.post('/add-product', isAuth.admin, (req, res, next) => {
    var productBody = req.body;
    const product = new Product(productBody); // this is modal object.

    product.save()
        .then((productBody) => {
        })
        .catch((err) => {
            console.log(err);
        });

    if (debug) console.log("Product created");
    res.redirect("/home-product");
});

/**
  * Get method for products. This method gets the products from the products collection, so it can be displayed on the admin page.
  * @author Nikisha & Heba
  */
router.get('/admin-products', isAuth.admin, async (req, res, next) => {
    fetch(req.protocol + '://' + req.get('host') + '/api/products')
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            res.render("AdminProducts", { products: data.products, admin: req.session.admin });
        });
});

/**
 * Delete method for admin products. This method deletes the product off the admin page as well as the products collection in mongodb.
 * @author Heba
 */
router.delete('/admin-products/:id', isAuth.admin, (req, res, next) => {
    let prod = { _id: req.params.id }

    Product.deleteOne(prod, function (err) {
        if (err) {
            console.log(err);
        }
    });
    res.redirect('/home-product');
});

/**
 * Get the edit page for the selected product.
 * @author Heba
 */
router.get('/edit-product/:id', isAuth.admin, (req, res, next) => {
    let id = req.params.id;
    res.render("editproduct", { id: id });
});

/**
 * Update product. This method will update the selected product in a seperate page and it will then update it in the products collection in mongodb. The update will be shown on the page.
 * @author Heba
 */
router.post('/edit-product/:id', isAuth.admin, async (req, res, next) => {
    var productBody = req.body;
    let prod = {
        name: productBody.name,
        price: productBody.price,
        description: productBody.description
    };

    Product.updateOne({ _id: req.params.id }, prod, function (err) {
        if (err) {
            console.log(err);
        }
        if (debug) console.log('Product updated');
    });
    res.render("AdminProducts");
});

/**
 * Get recommended products based on weather.
 * @author Heba
 */
router.get('/recommended', async (req, res, next) => {

    // Service for IP Geolocation
    var api_url = 'https://geo.ipify.org/api/v1?';

    // IPify API key
    var api_key = 'at_RaNCjnrp4MH5VRSKfOdYbfkkoSyKO';

    var url = api_url + 'apiKey=' + api_key;

    let str;
    let weatherStr;

    https.get(url, function (response) {
        // Read data from API response
        response.on('data', function (chunk) { str += chunk; });
        response.on('end', function () {
            // Strip invalid string from JSON
            let geoInfo = JSON.parse(str.replace("undefined", ""));

            // Extract user's latitude and longitude from response
            let lat = geoInfo.location.lat;
            let lng = geoInfo.location.lng;
            if (debug) console.log("lat: ", lat, " lng: ", lng);

            // OpenWeatherMap API key
            const weatherAPIKey = "66bc30e927163dbeeb574de5e5bc4f74";

            // Query OpenWeatherMap using latitude and longitude
            const weatherURL = "http://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lng + "&APPID=" + weatherAPIKey;

            http.get(weatherURL, function (response) {
                // Read weather response
                response.on('data', function (chunk) { weatherStr += chunk; });
                response.on('end', function () {
                    // Strip invalid characters from response
                    weatherStr = weatherStr.replace("undefined", "");

                    // Parse response JSON
                    let weatherJSON = JSON.parse(weatherStr);

                    // Extract weather ID
                    let weather = weatherJSON.weather[0].main;

                    if (debug) console.log("Weather: " + weather);

                    // Query DB to find appropriate clothing for weather at user's location
                    Product.find({ weather: weather }).then(productBody => {
                        // Render recommended products
                        res.render("Recommended", { weather: weather, products: productBody, loggedin: req.session.loggedin, admin: req.session.admin });
                    })
                });
            }).end();
        });
    }).end();
});

module.exports = router;
