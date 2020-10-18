var express = require('express');
var router = express.Router();

const http = require("http");
const https = require("https");
const zxcvbn = require('zxcvbn');

const db = require('../config/mongodb');
const Product = db.Product;

router.post('/password', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');

    var userBody = req.body;
    const password = userBody.password;
    
    if (password == undefined) {
        res.status(400).json({
            success: false,
            message: "Password missing."
        });
        return;
    }

    let result = zxcvbn(password);

    res.status(200).json({
        result
    });
    return;
});

router.get('/products', async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');

    Product.find({}).then(productBody => {
        res.status(200).json({
            products: productBody
        });
    })
});

router.get('/weather', async (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');

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

            // OpenWeatherMap API key
            const weatherAPIKey = "66bc30e927163dbeeb574de5e5bc4f74";

            // Query OpenWeatherMap using latitude and longitude
            const weatherURL = "http://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lng + "&APPID=" + weatherAPIKey;

            http.get(weatherURL, function (response) {
                // Read weather response
                response.on('data', function (chunk) { weatherStr += chunk; });
                response.on('end', function () {
                    let str = JSON.parse(weatherStr.replace("undefined", ""));;
                    res.status(200).json({
                        str
                    });
                    return;
                });
            }).end();
        });
    }).end();
});

module.exports = router;
