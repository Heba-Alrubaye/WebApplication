const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * user schema for the collection in the database.
 * This sets the information that will be put into the collection and 
 * displayed on the page and used in app.js.
 */
const userSchema = new Schema({
    email: { type: String, unique: true, required: true },
    hash: { type: String, required: true },
    google: Boolean,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    admin: Boolean
});

module.exports = mongoose.model('User', userSchema);