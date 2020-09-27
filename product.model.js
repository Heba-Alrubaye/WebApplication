const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProuctSchema = new Schema({
    id:{
        type: Number,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    }
})

module.exports=mongoose.model('Product', ProuctSchema);