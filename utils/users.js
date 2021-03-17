//This file is to track active users, this is also how id's are managed for groups and DM's

// array of all active users
const users = [];

// Adds user to array with room location
function userJoin(id, username, room) {
  const user = { id, username, room };

  users.push(user);

  return user;
}

//gets all users by returning the array, useful for displaying the online users
function getUsers() {
  return users;
}

// unused function, I was going to use it get socket ID's, but those aren't static
function getUserSocket(user) {
  return users.find(user => user.username === user)
}

// Used to get the current user based on their socket ID
function getCurrentUser(id) {
  return users.find(user => user.id === id);
}

//Removes user from the array it that room
function userExit(id) {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

// I use this to get the room the user is currently in, good for refreshes
function getRoomUser(room) {
  return users.filter(user => user.room === room);
}

// this function is sort of a unique hashing,
// I actually use the two usernames and hash them together to create a socket ID
// This works because usernames are unique, this probably isn't very secure though.
function privateRoom(username, otherUsername) {
  if(username < otherUsername) return (username + otherUsername);
  else return (otherUsername + username)
}

// export to index.js
module.exports = {
  getCurrentUser,
  getRoomUser,
  userJoin,
  userExit,
  getUserSocket,
  privateRoom,
  getUsers
}