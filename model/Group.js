// This file creates the schema for MongoDB

const mongoose = require("mongoose");

// group schema only contains the name of the group
const groupSchema = new mongoose.Schema({
  name: {
    type: String
  },
  
  },
    {
      timestamps: true
});

// export to index.js
module.exports = mongoose.model("Group", groupSchema);