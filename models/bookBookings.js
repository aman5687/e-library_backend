const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
    bookToken:{
        type:String,
        required:true,
    },
    userToken:{
        type:String,
        required:true,
    },
    bookingToken:{
        type:String,
        required:true,
    },
})


module.exports = mongoose.model("booking", BookingSchema);