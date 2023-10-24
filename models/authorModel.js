const mongoose = require("mongoose");

const authroSchema = new mongoose.Schema({
    authorName:{
        type:String,
        required:true,
    },
    authorDesc:{
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

module.exports = mongoose.model("author", authroSchema);