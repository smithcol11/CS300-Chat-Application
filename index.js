// Most of my consts are declared here from my Node-modules
const express = require("express");
const app = express();
const port = process.env.PORT || 3000
const session = require("express-session");
const LocalStrategy = require("passport-local");
const User = require("./model/User");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const moment = require('moment');
const http = require("http");
const Group = require("./model/Group");

// import from messages.js
const {
  formatMessageDB,
  formatMessage
 } = require("./utils/messages");
// import from users.js
const {
  getCurrentUser,
  userJoin, 
  userExit,
  getRoomUser, 
  getUserSocket,
  privateRoom,
  getUsers
} = require("./utils/users");

//this is my .env file, contains the address and data for MongoDB
require("dotenv").config();

//connect to DB
mongoose.connect(process.env.DATABASE, {
  useCreateIndex: true,
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

//Error checking
mongoose.connection.on("error", (err) => {
  console.log("Mongoose Connection ERROR: " + err.message);
});

//success
mongoose.connection.once("open", () => {
  console.log("MongoDB Connected");
});

//session for socket, uses cookies
app.use(session({
  secret:"Welcome",
  resave: false,
  saveUninitialized: false,
  cookie: {

  }
}));

// This is my passport initialization
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new LocalStrategy(User.authenticate()));
// I use .ejs over .html, so I can use views to simplify from page calls
app.set("view engine","ejs");
app.use(bodyParser.urlencoded(
      { extended:true }
))
//Initialize the session with passport
app.use(passport.initialize());
app.use(passport.session());

//Saw many people use this call when using passport, but I don't know what it does
app.use(function (req, res,next){
    res.locals.currentUser = req.user;
    next();
})

//Checks if the user is still logged in, I don't use it though
function isLoggedIn(req,res,next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

//This next bit contains all my gets and posts for the different web pages I display
//This is simplified using EJS, I highly recommend trying it.
//home page
app.get('/', (req, res) => {
  res.render("home");
});

//also home page, users cant bypass auth
app.get("/index", function(req, res) {
  res.render("home");
});

//actually gets the user to index, requires auth
app.get("/index-Czat", function(req, res) {
  res.render("index", {username: req.user.username});
});

//login page
app.get("/login", function(req, res) {
  var temp = true;
  res.render("login", {fail: temp});

});

//redirect for login failure, shows banner
app.get("/login-fail", function(req, res) {
  var temp = false;
  res.render("login", {fail: temp});
});

// meme Doge lmao
app.get("/about", function(req, res) {
  res.render("about");
});

//posts using passport for auth
app.post("/login", passport.authenticate("local", {
  successRedirect: "/index-Czat",
  failureRedirect: "/login-fail"
}),
  function(req, res) {
    res.sendStatus(401)
    res.send("Not authorized user")
});

//register page
app.get("/register", function(req, res) {
  res.render("register", {exist: "no"});
});

//post using passport for registration and auth, checks for duplicates and such
app.post("/register",(req,res)=>{
    
  User.register(new User({username: req.body.username,}),req.body.password,function(err,user){
      if(err){
          console.log(err);
          // redirect to page if failure to try again
          res.render("register", {exist: "yes"});
      }
    passport.authenticate("local")(req,res,function(){
        res.redirect("/login");
    })    
  })
})

//on logout, returns to login page
app.get("/logout", function (req, res) { 
  req.logout(); 
  res.redirect("/login"); 
}); 

//uses passport for the duration of session
passport.session

//server listen on port3000 or hosted website, which is heroku
const server = app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

//const for io, socket.io
const io = require('socket.io')(server);

//Where I finally grab my message schema
require("./model/Message")
const Message = mongoose.model("Message");

//On connection, all socket work can begin between server and local user
io.on('connection', (socket) => {

  console.log('user connected');

  //at connect, gets all users from array, this being the active users, and displays it
  var users = getUsers();
  socket.on("Online", (user) => {
    for(var i = 0; users[i] != null; i++) {
      io.emit("onlineUsers", users[i].username);
    }
  })
  
  // loads User data from the database to be emitted using socket.io
  User.find((err, data) => {
    if(err)
      console.log(err);
    else
      socket.emit('allUsers', data);
  })

  // loads Group data from the database to be emitted using socket.io
  Group.find((err, data) => {
    if(err)
      console.log(err)
    else
      socket.emit('loadRoom', data)
  })

  //Emit delRoom is called, removes user from room and sends them to global
  socket.on("delRoom", function(room) {
    var myQuery = { name: room }
    Group.deleteOne(myQuery, function(err, obj) {
      if(err) throw(err);
      //const userF = userExit(socket.id);
        //if (userF) {
        //socket.leave(room);
      //}
      io.emit("goHome", room);
    })
  })

  //loads the passed in room id from database
  socket.on("loadRoom", function(room) {
    Message.find((err, data) => {
      if(err)
        console.log(err)
      else
        socket.emit('load', ({ data, room }))
    });
    
  })

  // cheeky PM code, I splice the usernames together to create unique room ids from the unique users
  socket.on("privateRoom", (otherUser) => {
    const sender = getCurrentUser(socket.id);
    const room = privateRoom(sender.username, otherUser);
    const user = userJoin(socket.id, sender.username, room); 
    const userF = userExit(socket.id);
    if (userF) {
      socket.leave(userF.room);
      socket.broadcast.to(userF.room).emit('message',formatMessage(bot, `${userF.username} has left the chat`));
    }
    socket.join(room);
    socket.emit("message", formatMessage(bot,"Welcome to Czat"));
    socket.broadcast.to(room).emit("message", formatMessage(bot, `${user.username} has joined the chat.`));
  })

  // This actually never gets called, I should probably just delete it?
  socket.on("PM", (message) => {
    const user = getCurrentUser(socket.id);
    const room = user.room;
    io.to(room).emit("message", formatMessage(user.username, message));
  })

  //Name of my bot!
  var bot = 'Czat Bot: ';

  //socket handshakes with user
  io.use((socket, next) => {
    const user = socket.handshake.auth.user;
    socket.user = user;
    next();
  })

  //some more unused code, Maybe I should delete it??
  socket.on("user", function(data) {
    socket.emit("user", data);
    if(users.indexOf(data) > -1) {
      socket.emit('userSet', {username: data})
    }
    else {
      users.push(data);
      socket.emit('userSet', {username: data})
    }
  })

  //removes the user from the current room and has them join the new room via socket.id.
  // bot announces leaving and new users
  socket.on("joinRoom", ({ username, room}) =>{
    const userF = userExit(socket.id);
    if (userF) {
      socket.leave(userF.room);
      socket.broadcast.to(userF.room).emit('message',formatMessage(bot, `${userF.username} has left the chat`));
    }
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);
    socket.emit("message", formatMessage(bot,"Welcome to Czat"));
    socket.broadcast.to(user.room).emit("message", formatMessage(bot, `${user.username} has joined the chat.`));
    io.to(user.room).emit('roomUsers', {room: user.room, users: getRoomUser(user.room)});
  })

  //This is how chat messages are stored, formated, and passed to the proper room
  socket.on('chat message', ( {msg, room} ) => {
    const user = getCurrentUser(socket.id);
    const userRoom = user.room;
    io.to(userRoom).emit('message', formatMessage(user.username, msg));
    var message = formatMessage(user.username, msg);
    const newMessage = new Message({
      name: userRoom,
      username: message.username,
      text: message.text,
      time: message.time,
    });
    newMessage.save();
  });

  //When a new group is made, it is added to the DB
  socket.on("group", (room) => {
    const newGroup = new Group({
      name: room,
    })
    newGroup.save(); // save is how you add to DB
    io.emit("reload", room)
  })
  
  // when a user disconnects, they are removed from all rooms, then 
  // removed from online list and disconnected
  socket.on('disconnect', () => {
    const user = userExit(socket.id);
    console.log('user disconnected');
    if (user) {
      socket.leave(user.room);
      io.emit("Offline", user.username)
      io.to(user.room).emit('message',formatMessage(bot, `${user.username} has left the chat`));
      //io.to(user.room).emit('roomUsers', {room: user.room, users: getRoomUser(user.room)});
    }
  });
})
