var express = require('express');
const isAuth = require('../middleware/is-auth');
var router = express.Router();

router.get('/', (req, res, next) => {
    console.log("User " + req.session.email + " is logged in!");
    res.redirect("/home-product");
});

module.exports = router;

