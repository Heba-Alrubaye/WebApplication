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
    
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
    cartProds:[
        {
            prodId: Number,
            name: String,
            price: Number,
            // quantity: Number,
            description:String

            // name: { type: String, required: true },
            // price: {type: Number, required:true },
            // description: {type: String, required:true },

        }


    ],
    active: {
        type: Boolean,
        default: true
      },
      modifiedOn: {
        type: Date,
        default: Date.now
      }
    },
    { timestamps: true }
 

);

module.exports = mongoose.model("Cart", cartSchema);
