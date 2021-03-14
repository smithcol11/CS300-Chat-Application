const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  username: {
    type: String
    },
  text: {
    type: String
  },
  time: {
    type: String
  },
  
  },
    {
      timestamps: true
});

module.exports = mongoose.model("Message", messageSchema);