// I use this file to format messages into an object, this allows for many sections, including a date
// moment to get the time
const moment = require('moment');

// formats the object to have three parts
function formatMessage(username, text) {
  return {
    username,
    text,
    time: moment().format('h:mm a')
  };
}

// Unused function, I planned on using this, but actually don't
function formatMessageDB(username, test, time)
{
  return {
    username,
    text,
    time: time.format('h:mm a')
  };
}

// export to index.js
module.exports = {
  formatMessage,
  formatMessageDB
}