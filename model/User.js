// This file creates the schema for MongoDB

const mongoose = require("mongoose");
// uses passport for authentication, login and register
const passportLocalMongoose = require("passport-local-mongoose");

// schema contains username and password, as well as some requirements
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    //required: true,
    unique: true,
    trim: true,
    minlength: 1
  },
  password: {
    type: String,
    //required: true,
    minlength: 1,
  },
  
},  {
  timestamps: true,
});

// export the schema to passport and then to index.js
userSchema.plugin(passportLocalMongoose);
const User = mongoose.model('User', userSchema);
module.exports = User;