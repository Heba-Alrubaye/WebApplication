var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
// var cookieParser = require('cookie-parser');
var session = require('express-session')
var mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const db = require('./mongodb');
// const Products = require('./product.model');
const User = db.User;
const Product = db.Product;
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

app.use(session({secret: 'OUR SECRET'}));




app.get('/add-product', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'views', 'AddProduct.html'));
    // res.sendFile(path.join(__dirname, 'views', '/cart'));
});

app.post('/add-product', (req, res, next) => {
    console.log('it entered post');
    var productBody = req.body;
    const product = new Product(productBody); // this is modal object.
    console.log("product created");
    product.save()
    .then((productBody)=> {
        console.log(productBody);
        console.log("product saved");
        //res.redirect('/');
    })
    .catch((err)=> {
        console.log(err);
    })

    // Product.countDocuments({ name: productBody.name, price: productBody.price }, async function (err, count) {
    //     try{
    //         if (count > 0) console.log("item already exist!")
    //         else {
    //             console.log("creating user");
    
    //             const product = new Product(productBody);
    //             console.log("product created");
    //             console.log(req.body);
    
    //             product.save();
    //             console.log("product saved");
    //             res.redirect('/');
    //         }
    //     }catch(err){
    //         console.error(err);
    //     }

    // })

    res.sendFile(path.join(__dirname, 'views', 'AddProduct.html'));

});

app.get('/admin-products', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'views', 'AdminProducts.html'))
});

// app.get('/home', (req, res, next) => {
//     res.sendFile(path.join(__dirname, 'views', 'HomePage.html'))
//     res.sendFile(path.join(__dirname, 'views', 'AddProduct.html'))
// });

app.get('/cart', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'views', 'Cart.html'))
});

app.get('/edit', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'views', 'Edit.html'))
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

    User.countDocuments({ email: userBody.email }, async function (err, count) {
        try{
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
        }catch(err){
            console.error(err);
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
    if (req.session.loggedin) {
        console.log("Already logged in as " + req.session.email + "!");
        return res.status(400).json({message: "Already logged in as " + req.session.email + "!"});

    }
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
        const token = jwt.sign({ sub: user.id }, "placeholder secret", { expiresIn: '7d' });
        console.log(token);
        req.session.loggedin=true;
        req.session.email = user.email;
        console.log("User logged in: " + req.session.loggedin);
        res.redirect("/");
        // addProd;
    } else {
        console.log('password doesn\'t match');
    }
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



// app.post('/add-product', (req, res) => {
//     productCollection.insertOne(req.body)
//       .then(result => {
//         console.log(result)
//         res.redirect('/AddProduct.html')
//       })
//       .catch(error => console.error(error))
//   })

// /**
//  * The get request for product.
//  */
// app.get('/add-product', (req, res, next) => {
//     console.log('get products!');
//     Products.find({}).then(eachOne =>{

//         res.json(eachOne);
//     })


//     // res.sendFile(path.join(__dirname, 'views', 'AddProduct.html'))
// });

/**
 * post product to mongodb.
 */
// app.post('/adminProducts', (req, res, next) => {
//     Products.create({
//         id = req.body.id,
//         name = req.body.name,
//         price = req.body.prices

//     }).then(product =>{
//         res.json(product)
//     });
// });

// /**
//  * get product id
//  */
// app.get('/add-product: id', (req, res, next) => {
//     Products.findById(req.params.id).then(function(err, product){
//         if(err){
//             res.send(err)
//         }
//         res.json(product)
//     })
//     // console.log('get products!');
//     // Products.find({}).then(eachOne =>{

//     //     res.json(eachOne);
//     })




//     // res.sendFile(path.join(__dirname, 'views', 'AddProduct.html'))
// // })

// /**
//  * Update product
//  */
// app.put('/add-product: id', function(req, res){

//     Products.findOneAndUpdate({
//         id = req.body.id,
//         name = req.body.name,
//         price = req.body.prices

//     }).then(product =>{
//         res.json(product)
//     });
// });

// /**
//  * delete
//  */
// app.delete('/add-product: id', function(req, res){

//     Products.findOneAndRemove({
//         id = req.body.id,
//         name = req.body.name,
//         price = req.body.prices

//     }).then(product =>{
//         res.json(product)
//     });
// });



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
