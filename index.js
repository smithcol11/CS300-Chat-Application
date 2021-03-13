const express = require("express");
const app = express();
const port = process.env.PORT || 3000
const session = require("express-session");
const LocalStrategy = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const User = require("./model/User");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");

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
    maxAge: 2*60*1000
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
  //res.sendFile(__dirname + '/index.html');
  res.render("home");
});

app.get("/index", function(req, res) {
  res.render("index");
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/about", function(req, res) {
  res.render("about");
});

app.post("/login", passport.authenticate("local", {
  successRedirect: "/index",
  failureRedirect: "/login"
}),
  function(req, res) {
});

app.get("/register", function(req, res) {
  res.render("register");
});

app.post("/register",(req,res)=>{
    
  User.register(new User({username: req.body.username,}),req.body.password,function(err,user){
      if(err){
          console.log(err);
          res.render("register");
      }
  passport.authenticate("local")(req,res,function(){
      res.redirect("/login");
  })    
  })
})
 
app.get("/logout", function (req, res) { 
  req.logout(); 
  res.redirect("/login"); 
}); 

function isLoggedIn(req, res, next) { 
  if (req.isAuthenticated()) return next(); 
  res.redirect("/login"); 
} 

const server = app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

const io = require('socket.io')(server);

require("./model/Message")
const Message = mongoose.model("Message");

io.on('connection', (socket) => {
  console.log('user connected');

  socket.on('chat message', (msg) => {
    console.log('message: ' + msg);
  });

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);

    const newMessage = new Message({
      message: msg
    });
    newMessage.save();
  });
  
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});
