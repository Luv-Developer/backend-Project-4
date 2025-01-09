const mongoose = require("mongoose")
const userschema = mongoose.Schema({
    username:String,
    email:String,
    password:String
})
const usermodel = mongoose.model("user",userschema)
module.exports = usermodel
