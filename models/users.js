const mongoose = require('mongoose')

const users = mongoose.Schema({
    fullname:String,
    email : String,
    password : String ,
    destination: String 
})

module.exports = mongoose.model("user" , users)


