const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  name: {
    type: String
  },
  
  },
    {
      timestamps: true
});

module.exports = mongoose.model("Group", groupSchema);