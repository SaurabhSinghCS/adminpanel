var mongoose = require('mongoose')
var passportLocalMongoose = require('passport-local-mongoose')

var userdataSchema = new mongoose.Schema({
    username:String,
    name:String,
    email:String
});

userdataSchema.plugin(passportLocalMongoose);
  
module.exports = mongoose.model("userdata",userdataSchema);