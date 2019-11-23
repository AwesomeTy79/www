"use strict";

var express = require('express');
var app = express();
var fs = require('fs');
var https = require('https').createServer({
  key: fs.readFileSync('./cert/privkey.pem'),
  cert: fs.readFileSync('./cert/fullchain.pem')
}, app);
var io = require("socket.io")(https);
const process = require('process');

process.title = "WebServer";
app.use(express.static("public"));
app.get('/', function (req, res) {
  res.sendFile(__dirname + "/pages/index.html", function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log('Sent:');
    }
  });
});
app.get('/room', function(req, res){
  res.sendFile(__dirname + '/pages/chat/chat.html');
});
app.get('/chat', function(req, res){
  res.sendFile(__dirname + '/pages/chat/root.html');
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
https.listen(443, function () {
  console.log('Running on port 443!');
});
