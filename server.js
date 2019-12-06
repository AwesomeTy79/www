"use strict";

// Modules
const express = require('express');
const app = express();
const fs = require('fs');
const https = require('https').createServer({
  key: fs.readFileSync('./cert/privkey.pem'),
  cert: fs.readFileSync('./cert/fullchain.pem')
}, app);
const io = require("socket.io")(https);
const process = require('process');
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
var session = require("express-session"),
    bodyParser = require("body-parser");
var crypto = require("crypto");
var sqlite3 = require("sqlite3");
var db = new sqlite3.Database('./users.db');
var cookieParser = require('cookie-parser');
function hashPassword(password, salt) {
  var hash = crypto.createHash('sha256');
  hash.update(password);
  hash.update(salt);
  return hash.digest('hex');
}
// Middleware
function middleware() {
  app.set('view engine', 'pug');
  app.set('views', './views');
  app.use(express.urlencoded());
  app.use(cookieParser());
  app.use(session({ secret: "iuoiudwiouwqoiudwqiudioodiwquoiduiouqwuoidoihjheojpwiehjidoqcshjlksaj" }));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use((req, res, next) => {console.log(req.headers['x-forwarded-for'] || req.connection.remoteAddress); next();});

  passport.use(new LocalStrategy(function(username, password, done) {
    db.get('SELECT salt FROM users WHERE username = ?', username, function(err, row) {
      if (!row) return done(null, false);
      var hash = hashPassword(password, row.salt);
      db.get('SELECT username, id FROM users WHERE username = ? AND password = ?', username, hash, function(err, row) {
        if (!row) return done(null, false);
        return done(null, row);
      });
    });
  }));

  passport.serializeUser(function(user, done) {
    return done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    db.get('SELECT id, username FROM users WHERE id = ?', id, function(err, row) {
      if (!row) return done(null, false);
      return done(null, row);
    });
  });
  app.use(function (req, res, next) {
      // no: set a new cookie
      if (req.user) {
        var uname=req.user.username;
      }
      else {var uname="none"}
      req.session.uname=uname
      next(); // <-- important!
  });
  app.use(express.static("public"));
  process.title = "WebServer";
}
// Pages
function pages() {
  app.get('/', function (req, res) {
    /*
    res.sendFile(__dirname + "/views/index.html", function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log('Sent index');
      }
    });*/
    var stuff
    if (req.session.uname != "none") {
      stuff = ["Log Out", "/logout"];
    }
    else {
      stuff = ["Log In", "/login"]
    }
    res.render('index', { loglabel: stuff[0], loglink: stuff[1] });
  });
  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });
  app.get('/login', (req, res) => {
    res.render('login');
  });
  app.post('/login', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' }));
  app.get('/signup', (req, res) => {
    res.render('signup');
  });
  app.post('/signup', (req, res) => {
    var username = req.body.username,
    salt = crypto.randomBytes(16),
    hash = hashPassword(req.body.password, salt);
    db.run(`INSERT INTO users(username, password, salt) VALUES("${username}", "${hash}", "${salt}")`, function(err) {
      if (err) {
        return console.log(err.message);
        res.redirect(307, "/nay");
      }
      else {
        res.redirect(307, "/yay");
      }
    });
    
  })
}
function chat() {
  app.get('/room', function(req, res){
    res.render('views/chat');
  });
  app.get('/chat', function(req, res){
    res.render('chat/root');
  });
  app.get('/get', function(req, res){
    res.send(Object.keys(io.sockets.sockets));
  });
  var online = [];
  app.get('/online', function(req, res){
    res.json(online);
  });
  io.on('connection', function(socket){
    if (socket.request._query["uname"] !== undefined && socket.request._query["room"] !== undefined) {
    online.push({username: socket.request._query["uname"], room: socket.request._query["room"]});}

    socket.on('chat message', function(msg){
      io.emit('chat message', msg);
    });
    socket.on('action', function(msg){
      io.emit('action', msg);
    });
    socket.on('disconnect', function() {
      online.splice(online.indexOf({username: socket.request._query["uname"], room: socket.request._query["room"]}), 1);
    });
  });
}
// Listen!
middleware();
pages();
chat();
https.listen(443, function () {
  console.log('Running on port 443!');
});
