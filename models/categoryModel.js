const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    categoryName:{
        type:String,
        required:true,
    },
    categoryDesc:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        required:true,
    },
    token:{
        type:String,
        required:true,
    },
})

module.exports = mongoose.model("category", categorySchema);