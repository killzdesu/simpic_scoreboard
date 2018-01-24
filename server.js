'use strict';

var express = require('express');
var app = express();
app.use(express.static(__dirname + '/public'));
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var favicon = require('serve-favicon');
app.set('port', 8080);
app.set('ip', '0.0.0.0');

import {teams, addAllUsers} from './team';

// route
app.use(favicon(__dirname + '/favicon.ico'));
app.get('/', function (req, res, next) {
  res.send('aa');
});
app.get('/chat', function (req, res, next) {
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
  res.sendFile(__dirname + '/monitor-react.html');
});
app.get('/draw', function (req, res, next) {
  res.sendFile(__dirname + '/draw.html');
});
app.get('/done', function (req, res, next) {
  res.sendFile(__dirname + '/done.html');
});

// error handle
app.all('*', function (req, res, next) {
  var err = new Error('Cannot GET "' + req.path + '".');
  err.status = 404;
  next(err);
});
app.use(function (err, req, res, next) {
  console.error(err.message);
  res.send('' + err.stack);
});

// socket.io
var users = {};
var monIo = io.of('/monitor');
var chatIo = io.of('/chat');
var cpIo = io.of('/cp');
var monSocket = void 0;

console.log(teams);

var updateMonitor = function updateMonitor(name) {
  monIo.emit('userChange', {
    img: users[name],
    name: name
  });
};
chatIo.on('connection', function (socket) {
  var name = 'Anonymous';

  socket.emit('connect', true);
  socket.on('name', function (data) {
    name = data.name;
    users[name] = '';
    updateMonitor(name);
    console.log(name + ' has joined');
  });
  /*socket.on('message', text => {
    console.log('message: "' + text + '" emitted by ' + name);
    chatIo.emit('message', {
      text,
      name,
    });
  });*/
  socket.on('imageSend', function (img) {
    var dd = new Date();
    cpIo.emit('image', { name: name, time: dd });
    console.log('image: (image) emitted by' + name);
    console.log('@: ' + dd.getMinutes() + ":" + dd.getSeconds());
    chatIo.emit('image', { img: img, name: name });
  });
  /*socket.on('typing', text => {
    console.log('typing: "' + text + '" emitted by ' + name);
    users[name] = text;
    updateMonitor(name);
  });*/
  socket.on('drawing', function (data) {
    console.log('drawing: (image) emitted by ' + name);
    users[name] = data;
    updateMonitor(name);
  });
  // removing user on "disconnect"
  socket.on('disconnect', function () {
    console.log(name + ' has left');
    if (users[name] !== undefined) {
      delete users[name];
      updateMonitor(name);
    }
  });
});
monIo.on('connection', function (socket) {
  monSocket = socket;
  socket.emit('allUsers', users);
});

cpIo.on('connection', function (socket) {
  socket.on('activate', function (data) {
    console.log("Activate drawing for " + data.second);
    data.time = new Date();
    chatIo.emit('activateDraw', data);
    cpIo.emit('activateDraw', data);
  });
});

// listen
http.listen(app.get('port'), app.get('ip'), function () {
  console.log('%s: Node server started on %s:%d ...', Date(Date.now()), app.get('ip'), app.get('port'));
});