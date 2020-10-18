var express = require('express');
var router = express.Router();

const http = require("http");
const https = require("https");

const isAuth = require('../middleware/is-auth');

const db = require('../config/mongodb');
const Product = db.Product;
const Cart = db.Cart;

const debug = false;

/**
 * Get method for products. This method gets the products from the products collection, so it can be displayed on the home page.
 * @author Nikisha
 */
router.get('/home-product', async (req, res, next) => {
    Product.find({}).then(productBody => {
        console.log(productBody);
        res.render("HomePage", { products: productBody, loggedin: req.session.loggedin, admin: req.session.admin });
    })
})

router.get('/details/:id', (req, res, next) => {
    console.log("inside put details");
    Product.findOne({ _id: req.params.id }, function (err, proddetail) {
        if (err) {
            console.log(err);
        } else {
            var product = proddetail;
            res.render("Details", { product: product, loggedin: req.session.loggedin, admin: req.session.admin }); //products: obj
        }
    });
});

/**
 * Get method for cart products. This method gets the products from the cart collection, so it can be displayed on the cart page.
 * @author Nikisha
 */
router.get('/cart', isAuth.user, async (req, res, next) => {
    Cart.find({}).then(cartProductBody => {
        res.render("Cart", { carts: cartProductBody, admin: req.session.admin });
    })
});

/**
 * Creates the product and adds it to the cart collection in mongodb.
 * @author Nikisha
 */
// router.post('/add-cart', isAuth.user, (req, res, next) => {
//     console.log('it entered post');
//     const { name, price, description } = req.body;

//     var cartProductBody = req.body;
//     const cartProduct = new Cart(cartProductBody); // this is modal object.
//     console.log("cart product created");

//     cartProduct.save()
//         .then((cartProductBody) => {
//             console.log(cartProductBody);
//             console.log("cart product saved");

//         })
//         .catch((err) => {
//             console.log(err);
//         })
//     res.redirect("/home-product");
// });

// router.post('/add-cart', isAuth.user, async (req, res) => {
//     console.log("Entered add cart method!");
//     const { prodId, name, price, quantity, description } = req.body;

//     const userId = req.session.user; // the logged in user id

//     try {
//       let cart = await Cart.findOne({ userId });

//       if (cart) {
//         //cart exists for user
//         let itemIndex = cart.cartProds.findIndex(p => p.prodId == prodId);

//         if (itemIndex > -1) {
//           //product exists in the cart, update the quantity
//           let productItem = cart.cartProds[itemIndex];
//           productItem.quantity = quantity;
//           cart.cartProds[itemIndex] = productItem;
//         } else {
//           //product does not exists in cart, add new item
//           cart.cartProds.push({prodId, name, price, quantity, description });
//         }
//         cart = await cart.save();
//         console.log(cart);
//         // return res.status(201).send(cart);
//       } else {
//         //no cart for user, create new cart
//         const newCart = await Cart.create({
//           userId,
//           cartProds: [{ prodId, name, price, quantity, description  }]
//         });

//         // return res.status(201).send(newCart);
//       }
//     } catch (err) {
//       console.log(err);
//       res.status(500).send("Stuffed up!");
//     }
//     // res.redirect("/home-product");
//   });

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
  * @author Nikisha
  */
 router.get('/admin-products', isAuth.admin, async (req, res, next) => {
    Product.find({}).then(productBody => {
        res.render("AdminProducts", { products: productBody, admin: req.session.admin });
    })
});

/**
 * Delete method for admin products. This method deletes the product off the admin page as well as the products collection in mongodb.
 * @author Nikisha
 */
router.delete('/admin-products/:id', isAuth.admin, (req, res, next) => {
    let prod = { _id: req.params.id }

    Product.deleteOne(prod, function (err) {
        if (err) {
            console.log(err);
        }
        console.log('success')
    });
    res.redirect('/home-product');
});

/**
 * Get the edit page for the selected product.
 * @author Nikisha
 */
router.get('/edit-product/:id', isAuth.admin, (req, res, next) => {
    let id = req.params.id;
    res.render("editproduct", { id: id });
});

/**
 * Update product. This method will update the selected product in a seperate page and it will then update it in the products collection in mongodb. The update will be shown on the page.
 * @author Nikisha
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
                    let weatherID = weatherJSON.weather[0].id;
                    if (debug) console.log("Weather ID:" + weatherID);

                    let weather;

                    // Basic weather type identification based on ID
                    if (weatherID >= 200 && weatherID < 600) {
                        weather = "rain";
                    } else if (weatherID >= 600 && weatherID < 700) {
                        weather = "snow";
                    } else if (weatherID >= 700 && weatherID <= 800) {
                        weather = "sunny";
                    }

                    if (debug) console.log("Weather: " + weather);

                    // Query DB to find appropriate clothing for weather at user's location
                    Product.find({ weather: weather }).then(productBody => {
                        console.log(productBody);
                        // Render recommended products
                        res.render("Recommended", { weather: weather, products: productBody, loggedin: req.session.loggedin, admin: req.session.admin });
                    })
                });
            }).end();
        });
    }).end();
});

module.exports = router;
