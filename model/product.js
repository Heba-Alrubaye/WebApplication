const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Product schema for the collection in mongodb.
 */
const productSchema = new Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    weather: { type: String, required: false },
    image: { type: String, required: false }
});

module.exports = mongoose.model('Product', productSchema);
