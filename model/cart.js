const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartSchema = new Schema({
    // productId: { type: Number, required: true },
    cartProds:[
        {
            name: { type: String, required: true },
            price: {type: Number, required:true }

        }


    ]

});

// const Products =mongoose.model('Product', ProuctSchema);
module.exports = mongoose.model('Cart', cartSchema);
// module.exports = Products;