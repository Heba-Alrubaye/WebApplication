var express = require('express');
var router = express.Router();

var path = require('path');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);

const isAuth = require('../middleware/is-auth');

require('../config/passport')(passport);

const db = require('../config/mongodb');
const Product = db.Product;
const Cart = db.Cart;

const http = require("http");
const https = require("https");

/**
 *Product page for where all the get, put, post, delete requests 
 are done to use in the application for adding in items, deleting items, 
 creating items and updating items. //Nikisha  
 */

// var fs = require('fs'); 
// var path = require('path'); 
// var multer = require('multer'); 
  
// var storage = multer.diskStorage({ 
//     destination: (req, file, cb) => { 
//         cb(null, 'uploads') 
//     }, 
//     filename: (req, file, cb) => { 
//         cb(null, file.fieldname + '-' + Date.now()) 
//     } 
// }); 
  
// var upload = multer({ storage: storage }); 
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
    res.render('AddProduct');
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
    // var obj = {
    //     name: req.body.name,
    //     price: req.body.price,
    //     description: req.body.description,
    //     img: {
    //         data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)), 
    //         contentType: 'image/png'
    //     }
    // }
    
    console.log("product created");

    // product.create(obj, (err, item) => { 
    //     if (err) { 
    //         console.log(err); 
    //     } 
    //     else { 
    //         // item.save(); res.redirect('/home-product');  
    //         res.redirect('/'); 
    //     } 
    // }); 
    
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

/**
 * Get method for cart products. 
 * This method gets the products from the cart collection, so it can be 
 * displayed on the cart page.
 */
router.get('/cart', isAuth.user, async (req, res, next) => {
    console.log('get cart products');

    Cart.find({}).then(cartProductBody => {
        //console.log(productBody);
        res.render("Cart", { carts: cartProductBody, admin: req.session.admin });
    })
});




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
router.post('/edit-product/:id', isAuth.admin, async (req, res, next) => {
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




router.get('/details/:id', (req, res, next) => {
    console.log("inside put details");
//const product = await 
    Product.findOne({ _id: req.params.id }, function(err, proddetail){
        if (err) {
            console.log(err);
        }else{
            console.log('Product found');
            console.log(proddetail);
            var product = proddetail;
            res.render("Details", {product: product, loggedin: req.session.loggedin, admin: req.session.admin}); //products: obj

            // res.render("Details", {prodcut: product, user: req.session.user});


        }
        // res.render("Details", obj);

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
// router.get('/details/:id',isAuth.user, (req, res, next) => {
//     console.log("in details!!");
//     let id = req.params.id;
//     res.render("Details", {id: id, products: obj} );

//     //  res.sendFile(path.join(__dirname, 'views', 'Details.ejs')) { id: id, 
//  });

/**
 * get the cart page.
 */
router.get('/cart', isAuth.user, (req, res, next) => {
    res.render("cart");
});

/**
 * get the edit page for the selected product.
 */
router.get('/edit-product/:id', isAuth.admin, (req, res, next) => {
    let id = req.params.id;
    res.render("editproduct", { id: id });
});

/** Get recommended products based on weather
 * @author: Heba
 */
router.get('/recommended', async (req, res, next) => {

    // Service for IP Geolocation
    var api_url = 'https://geo.ipify.org/api/v1?';

    // IPify API key
    var api_key = 'at_RaNCjnrp4MH5VRSKfOdYbfkkoSyKO';

    var url = api_url + 'apiKey=' + api_key;

    let str;
    let weatherStr;

    https.get(url, function(response) {
        // Read data from API response
        response.on('data', function(chunk) { str += chunk; });
        response.on('end', function() { 
            // Strip invalid string from JSON
            let geoInfo = JSON.parse(str.replace("undefined", ""));

            // Extract user's latitude and longitude from response
            let lat = geoInfo.location.lat;
            let lng = geoInfo.location.lng;
            console.log("lat: ", lat, " lng: ", lng);

            // OpenWeatherMap API key
            const weatherAPIKey = "66bc30e927163dbeeb574de5e5bc4f74";

            // Query OpenWeatherMap using latitude and longitude
            const weatherURL = "http://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lng + "&APPID=" + weatherAPIKey;
            
            console.log(weatherURL);

            http.get(weatherURL, function(response) {
                // Read weather response
                response.on('data', function(chunk) { weatherStr += chunk; });
                response.on('end', function() {
                    // Strip invalid characters from response
                    weatherStr = weatherStr.replace("undefined", "");

                    // Parse response JSON
                    let weatherJSON = JSON.parse(weatherStr);

                    // Extract weather ID
                    let weatherID = weatherJSON.weather[0].id;
                    console.log(weatherID);

                    let weather;

                    // Basic weather type identification based on ID
                    if (weatherID >= 200 && weatherID < 600) {
                        weather = "rain";
                    } else if (weatherID >= 600 && weatherID < 700) {
                        weather = "snow";
                    } else if (weatherID >= 700 && weatherID <= 800) {
                        weather = "sunny";
                    }

                    console.log("weather is: " + weather);

                    // Query DB to find appropriate clothing for weather at user's location
                    Product.find({weather: weather}).then(productBody => {
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