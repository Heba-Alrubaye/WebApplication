const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: { type: String, unique: true, required: true },
    hash: { type: String, required: true },
});

module.exports = mongoose.model('User', userSchema);