const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Cart schema for the collection in mongodb.
 * This sets the information that will be put into the collection and 
 * displayed on the page and used in app.js.
 */
const cartSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  cartProds: [{ name: String, price: Number }],
  active: { type: Boolean, default: true },
  modifiedOn: { type: Date, default: Date.now }
},
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
