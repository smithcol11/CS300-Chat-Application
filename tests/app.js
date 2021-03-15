const express = require('express')
const app = express()
require("dotenv").config()


app.get('/', (req, res) => {
    res.sendStatus(200)
    res.redirect("/home");});

app.get('/index',(req, res) => {
  res.sendStatus(200)
  res.redirect("/index");
});

app.get('/login', (req, res) => {
  res.sendStatus(200)
  res.redirect("/login");
});

app.get('/register', (req, res) => {
  res.sendStatus(200)
  res.redirect("/register");});

app.get('/about', (req, res) => {
  res.sendStatus(200)
  res.redirect("/about");});

module.exports = app