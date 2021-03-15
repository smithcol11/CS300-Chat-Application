# PDXCzat
# Czat - Software: Messaging App

## Introduction

> This is my first attempt at any sort of software development. This is for my CS300 course at PSU. Czat is an instant messaging app with many features that mainstream apps contain, such as user authentication, hosting, database access, group messaging, etc.

## Code Samples

>  User.js

```javascript

const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
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

userSchema.plugin(passportLocalMongoose);
const User = mongoose.model('User', userSchema);
module.exports = User;

```

>Index.ejs

```EJS
<form id="login" action="/login" method="POST" class="container needs-validation w-75" style="max-width: 500px; margin-top: 20%">
    <div class="form-group">
      <label for="username">Username</label>
      <input type="text" class="form-control" require id="username" required name="username">
    </div>
    <p></p>
    <div class="form-group">
      <label for="password">Password</label>
      <input type="password" class="form-control" id="password" required name="password"> 
    </div>
    <p></p>
      <button type="submit" class="btn btn-primary">Login</button> 
      <script>
        var socket = io();

        var username = document.getElementById("username");
        var form = document.getElementById("login");
        form.addEventListener("submit", (e) => {
          document.cookie = username.value;
          socket.emit('user', document.getElementById('username').value);
        })
      </script>
  </form>
```

>index.js

```JavaScript
socket.on("joinRoom", ({ username, room}) =>{
    const userF = userExit(socket.id);
    if (userF) {
      console.log("user: " + userF.username + " room: " + userF.room);
      socket.leave(userF.room);
      socket.broadcast.to(userF.room).emit('message',formatMessage(bot, `${userF.username} has left the chat`));
    }
    const user = userJoin(socket.id, username, room);
    console.log("user: " + user.username + " room: " + user.room);
    socket.join(user.room);
    socket.emit("message", formatMessage(bot,"Welcome to Czat"));
    socket.broadcast.to(user.room).emit("message", formatMessage(bot, `${user.username} has joined the chat.`));
    io.to(user.room).emit('roomUsers', {room: user.room, users: getRoomUser(user.room)});
  })

  socket.on('chat message', ( {msg, room} ) => {
    const user = getCurrentUser(socket.id);
    console.log("user: " + user.username + " room: " + user.room);
    io.to(room).emit('message', formatMessage(user.username, msg));
    var message = formatMessage(user.username, msg);
    const newMessage = new Message({
      name: room,
      username: message.username,
      text: message.text,
      time: message.time,
    });
    newMessage.save();
  });
```

## Installation

> Download repository to folder. Need to have dependencies, these can be found in the package.json file. If you need to install those, use 'npm install xxxxx'. 
(Where xxxxx is the name of a dependency, Ex: 'npm install mongoose'.)

>The actual software is started by typing 'nodemon index.js'
