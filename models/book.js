const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
    bookName:{
        type:String,
        required:true,
    },
    bookDesc:{
        type:String,
        required:true,
    },
    bookFile:{
        type:String,
        required:true,
    },
    bookpublicId:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        required:true,
    },
    bookCategoryName:{
        type:String,
        required:true,
    },
    bookAuthorName:{
        type:String,
        required:true,
    },
    token:{
        type:String,
        required:true,
    },
    bookCategoryToken:{
        type:String,
        required:true,
    },
    bookAuthorToken:{
        type:String,
        required:true,
    },
    
})

module.exports = mongoose.model("book", bookSchema);