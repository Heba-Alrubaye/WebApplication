var express = require('express');
var router = express.Router();

router.get('/', (req, res, next) => {
    if (req.session.loggedin) {
        console.log("User " + req.session.email + " is logged in!");
        res.render("homepage");
    } else {
        console.log("User is not logged in!");
        res.render("login");
    }
});

module.exports = router;

