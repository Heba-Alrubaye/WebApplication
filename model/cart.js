const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Cart schema for the collection in mongodb.
* This sets the information that will be put into the collection and 
 * displayed on the page and used in app.js.
 * 
 */
const cartSchema = new Schema({
    // productId: { type: Number, required: true },
    cartProds:[
        {
            name: { type: String, required: true },
            price: {type: Number, required:true }

        }


    ]

});

module.exports = mongoose.model('Cart', cartSchema);
