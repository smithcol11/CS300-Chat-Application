const moment = require('moment');

function formatMessage(username, text) {
  return {
    username,
    text,
    time: moment().format('h:mm a')
  };
}

function formatMessageDB(username, test, time)
{
  return {
    username,
    text,
    time: time.format('h:mm a')
  };
}

module.exports = {
  formatMessage,
  formatMessageDB
}