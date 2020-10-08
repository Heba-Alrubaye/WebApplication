const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Product schema for the collection in mongodb.
 */
const productSchema = new Schema({
    // productId: { type: Number, required: true },
    name: { type: String, required: true },
    price: {type: Number, required:true }
});

// const Products =mongoose.model('Product', ProuctSchema);
module.exports = mongoose.model('Product', productSchema);
// module.exports = Products;

