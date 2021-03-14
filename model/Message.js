const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: {
    type: String
    },
  message: {
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