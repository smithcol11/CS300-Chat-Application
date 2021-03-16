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
const {
  formatMessageDB,
  formatMessage
 } = require("./utils/messages");
const {
  getCurrentUser,
  userJoin, 
  userExit,
  getRoomUser, 
  getUserSocket,
  privateRoom,
  getUsers
} = require("./utils/users");
const { time } = require("console");
const Group = require("./model/Group");
const { data } = require("jquery");

require("dotenv").config();

mongoose.connect(process.env.DATABASE, {
  useCreateIndex: true,
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

mongoose.connection.on("error", (err) => {
  console.log("Mongoose Connection ERROR: " + err.message);
});

mongoose.connection.once("open", () => {
  console.log("MongoDB Connected");
});

app.use(session({
  secret:"Welcome",
  resave: false,
  saveUninitialized: false,
  cookie: {

  }
}));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new LocalStrategy(User.authenticate()));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded(
      { extended:true }
))
app.use(passport.initialize());
app.use(passport.session());

app.use(function (req, res,next){
    res.locals.currentUser = req.user;
    next();
})

function isLoggedIn(req,res,next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

app.get('/', (req, res) => {
  res.render("home");
});

app.get("/index", function(req, res) {
  res.render("home");
});

app.get("/index-Czat", function(req, res) {
  res.render("index", {username: req.user.username});
});

app.get("/login", function(req, res) {
  var temp = true;
  res.render("login", {fail: temp});

});

app.get("/login-fail", function(req, res) {
  var temp = false;
  res.render("login", {fail: temp});
});

app.get("/about", function(req, res) {
  res.render("about");
});

app.post("/login", passport.authenticate("local", {
  successRedirect: "/index-Czat",
  failureRedirect: "/login-fail"
}),
  function(req, res) {
    res.sendStatus(401)
    res.send("Not authorized user")
});

app.get("/register", function(req, res) {
  res.render("register", {exist: "no"});
});

app.post("/register",(req,res)=>{
    
  User.register(new User({username: req.body.username,}),req.body.password,function(err,user){
      if(err){
          console.log(err);
          res.render("register", {exist: "yes"});
      }
  passport.authenticate("local")(req,res,function(){
      res.redirect("/index-Czat");
  })    
  })
})
 
app.get("/logout", function (req, res) { 
  req.logout(); 
  res.redirect("/login"); 
}); 

function LoggedIn(req, res, next) { 
  if (req.isAuthenticated()) return next(); 
  res.redirect("/login"); 
} 

passport.session

const server = app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

const io = require('socket.io')(server);

require("./model/Message")
const Message = mongoose.model("Message");

io.on('connection', (socket) => {

  console.log('user connected');

  var users = getUsers();
  socket.on("Online", (user) => {
    for(var i = 0; users[i] != null; i++) {
      console.log(users[i])
      io.emit("onlineUsers", users[i].username);
    }
  })
  
  // loads data from the database to be emitted using socket.io

  User.find((err, data) => {
    if(err)
      console.log(err);
    else
      socket.emit('allUsers', data);
  })

  Group.find((err, data) => {
    if(err)
      console.log(err)
    else
      socket.emit('loadRoom', data)
  })

  socket.on("delRoom", function(room) {
    var myQuery = { name: room }
    Group.deleteOne(myQuery, function(err, obj) {
      if(err) throw(err);
      console.log(room + " was removed")
      //const userF = userExit(socket.id);
        //if (userF) {
        //socket.leave(room);
      //}
      io.emit("goHome", room);
    })
  })


  socket.on("loadRoom", function(room) {
    Message.find((err, data) => {
      if(err)
        console.log(err)
      else
        socket.emit('load', ({ data, room }))
    });
    
  })

  socket.on("privateRoom", (otherUser) => {
    const sender = getCurrentUser(socket.id);
    console.log("user: " + sender.username + " room: " + sender.room);
    //const reciever = getUserSocket(otherUser);
    const room = privateRoom(sender.username, otherUser);
    const user = userJoin(socket.id, sender.username, room); 
    const userF = userExit(socket.id);
    if (userF) {
      console.log("user: " + userF.username + " room: " + userF.room);
      socket.leave(userF.room);
      socket.broadcast.to(userF.room).emit('message',formatMessage(bot, `${userF.username} has left the chat`));
    }
    socket.join(room);
    console.log("user: " + user.username + " room: " + user.room);
    socket.emit("message", formatMessage(bot,"Welcome to Czat"));
    socket.broadcast.to(room).emit("message", formatMessage(bot, `${user.username} has joined the chat.`));
  })

  socket.on("PM", (message) => {
    const user = getCurrentUser(socket.id);
    const room = user.room;
    io.to(room).emit("message", formatMessage(user.username, message));
  })

  var bot = 'Czat Bot: ';

  /*io.use((socket, next) => {
    const user = socket.handshake.auth.user;
    socket.user = user;
    next();
  })*/

  
  socket.on("user", function(data) {
    socket.emit("user", data);
    console.log("username: " + data);
    if(users.indexOf(data) > -1) {
      socket.emit('userSet', {username: data})
    }
    else {
      users.push(data);
      socket.emit('userSet', {username: data})
    }
  })

  socket.on("joinRoom", ({ username, room}) =>{
    console.log(`${room}`)
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

  socket.on("group", (room) => {
    const newGroup = new Group({
      name: room,
    })
    newGroup.save();
    io.emit("reload", room)
  })
  
  socket.on('disconnect', () => {
    const user = userExit(socket.id);
    //io.emit("Offline", user.username)

    if (user) {
      socket.leave(user.room);
      io.to(user.room).emit('message',formatMessage(bot, `${user.username} has left the chat`));
      //io.to(user.room).emit('roomUsers', {room: user.room, users: getRoomUser(user.room)});
    }
  });
})
