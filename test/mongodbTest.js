const { assert } = require('chai');
const mongoose = require('mongoose');

const username = "admin";
const password = "BiINPxSnYq4ygeRf";

const uri = `mongodb+srv://${username}:${password}@cluster0.7fsul.mongodb.net/shop`;

const db = require('../config/mongodb');
const User = db.User;

before(function (done) {
    mongoose.connect(uri);
    mongoose.connection.once('open', function () {
        console.log("Connected");
        done();
    }).on('error', function (error) {
        console.log("Error", error)
    })
});

describe('Saving records', function () {
    it('Saves a record to the database', function (done) {
        var user = new User({
            email: 'vtcsuyfccwtmsswuxn@twzhhq.online',
            hash: '$2a$10$5k62KEe2ptr2bJLnfpj4H.3BC73I7ywOISICRc1JxmLvNIyGakLNq'
        })

        user.save().then(function () {
            assert(user.isNew === false);
            done();
        })
    })
})

describe('Finding records', function () {
    var user;
    beforeEach(function(done) {
        user = new User({
            email: 'gjiovkduamqvnlumkk@miucce.online',
            hash: '$2a$10$y7hRcUkPGokRSFlDpvK8G./o3vbkBOtxdy9CDpLpjnpQ11fvm88by'
        })

        user.save().then(function () {
            assert(user.isNew === false);
            done();
        })
    })

    it('Finds one record from the database', function (done) {
        User.findOne({ email: 'gjiovkduamqvnlumkk@miucce.online' }).then(function(result) {
            assert(result.hash === '$2a$10$y7hRcUkPGokRSFlDpvK8G./o3vbkBOtxdy9CDpLpjnpQ11fvm88by')
            done();
        })
    })

    it('Finds one record by ID from the database', function (done) {
        User.findOne({ _id: user._id }).then(function(result) {
            assert(result._id.toString() === user._id.toString())
            done();
        })
    })

    afterEach(function(done) {
        User.findOneAndRemove({ email: user.email, hash: user.hash }).then(function () {
            User.findOne({ email: user.email }).then(function (result) {
                assert(result === null);
                done();
            })
        })
    })
})

describe('Deleting records', function () {
    it('Deletes one record from the database', function (done) {
        User.findOneAndRemove({ email: 'vtcsuyfccwtmsswuxn@twzhhq.online', hash: '$2a$10$5k62KEe2ptr2bJLnfpj4H.3BC73I7ywOISICRc1JxmLvNIyGakLNq' }).then(function () {
            User.findOne({ email: 'vtcsuyfccwtmsswuxn@twzhhq.online' }).then(function (result) {
                assert(result === null);
                done();
            })
        })
    })
})
