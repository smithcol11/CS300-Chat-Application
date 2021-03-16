const users = [];

function userJoin(id, username, room) {
  const user = { id, username, room };

  users.push(user);

  return user;
}

function getUsers() {
  return users;
}

function getUserSocket(user) {
  return users.find(user => user.username === user)
}

function getCurrentUser(id) {
  return users.find(user => user.id === id);
}

function userExit(id) {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

function getRoomUser(room) {
  return users.filter(user => user.room === room);
}

function privateRoom(username, otherUsername) {
  if(username < otherUsername) return (username + otherUsername);
  else return (otherUsername + username)
}

module.exports = {
  getCurrentUser,
  getRoomUser,
  userJoin,
  userExit,
  getUserSocket,
  privateRoom,
  getUsers
}