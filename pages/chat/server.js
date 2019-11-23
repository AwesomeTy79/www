var app = require('express')();
var http = require('http');
var server = http.Server(app)
var io = require('socket.io')(server);
var firebase = require("firebase");
var config = {
  apiKey: "AIzaSyBtpfJl64CKvQBZfHNTcxcvT_Lny5yaz7w",
  authDomain: "hellopersonglitch.firebaseapp.com",
  databaseURL: "https://hellopersonglitch.firebaseio.com",
  storageBucket: "hellopersonglitch.appspot.com"
};
firebase.initializeApp(config);
app.get('/room', function(req, res){
  res.sendFile(__dirname + '/chat.html');
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/root.html');
});

app.get('/updates', function(req, res){
  res.sendFile(__dirname + '/updates.html');
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


var listener = server.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 120000);
