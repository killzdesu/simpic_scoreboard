var express = require('express');
var moment = require('moment');
var app = express();
app.use(express.static(__dirname + '/public'));
var http = require('http').createServer(app);
var io = require('socket.io')(http);
app.set('port', 8080);
app.set('ip', '0.0.0.0');

// import {teams, addAllUsers} from './team';

app.get('/', function (req, res, next) {
  res.send('SIMPIC academic');
});
app.get('/chat', function (req, res, next) {
  res.sendFile(__dirname + '/chat.html');
});
app.get(/.*user$/, function (req, res, next) {
  res.sendFile(__dirname + '/chat.html');
});
app.get('/profile', function (req, res, next) {
  res.sendFile(__dirname + '/profile.html');
});
app.get('/cp', function (req, res, next) {
  res.sendFile(__dirname + '/control_panel.html');
});
app.get('/monitor', function (req, res, next) {
  res.sendFile(__dirname + '/monitor.html');
});
app.get('/mnt', function (req, res, next) {
  res.sendFile(__dirname + '/mnt.html');
});
//==== for favicon
app.get('/favicon.ico', function(req, res) {
  res.status(204);
});

// --- error handle ---
app.all('*', function (req, res, next) {
  var err = new Error('Cannot GET "' + req.path + '".');
  err.status = 404;
  next(err);
});
app.use(function (err, req, res, next) {
  console.error(err.message);
  res.send('' + err.stack);
});

// --- listen ---
http.listen(app.get('port'), app.get('ip'), function () {
  console.log('%s: Node started on %s:%d ..', Date(Date.now()), app.get('ip'), app.get('port'));
});



// #####*****----- socket -----*****##### //

var users = {};
var monIo = io.of('/monitor');
var chatIo = io.of('/chat');
var cpIo = io.of('/cp');
var monSocket = void 0;

console.log("---- All teams ----");
// console.log(team);

var updateMonitor = function updateMonitor(name) {
  monIo.emit('userChange', {
    img: users[name],
    name: name
  });
};

var updateMnt = function(img, name){
  monIO.emit('userChange', {
    img: img,
    name: name,
  })
}

// ----- CHAT BOX -----
chatIo.on('connection', function (socket) {
  var name = 'Anonymous';

  socket.emit('connect', true);

  socket.on('name', function (data) {
    name = data.name;
    users[name] = '';
    updateMonitor(name);
    cpIo.emit('userConnect', {name: name, time: new Date()});
    console.log(name + ' has joined');
  });

  socket.on('imageSend', function (data) {
    var dd = new Date();
    cpIo.emit('image', { name: name, time: dd, timeLeft: data.time });
    chatIo.emit('image', { img: data.img, name: name });

    console.log(`[${moment().format('hh:mm:ss.SSS')}]` + ': Image emitted by' + name);
  });

  socket.on('drawing', function (data) {
    console.log('drawing: (image) emitted by ' + name);
    users[name] = data;
    updateMonitor(name);
  });

  // --- removing user on "disconnect" ---
  socket.on('disconnect', function () {
    console.log(name + ' has left');
    cpIo.emit('userDisconnect', {name: name, time: new Date()});
    if (users[name] !== undefined) {
      delete users[name];
      updateMonitor(name);
    }
  });
});

// ----- MONITOR -----

monIo.on('connection', function (socket) {
  monSocket = socket;
  socket.emit('allUsers', users);
});

// ----- CONTROL PANEL -----

cpIo.on('connection', function (socket) {
  socket.on('activate', function (data) {
    console.log("Activate drawing for " + data.second);
    data.time = moment();
    chatIo.emit('activateDraw', data);
    cpIo.emit('activateDraw', data);
  });

  socket.on('score', function (data) {
    console.log('Score has been made');
    monIo.emit('score', data);
  });
});