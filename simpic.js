var express = require('express');
var moment = require('moment');
var chalk = require('chalk');
var app = express();
app.use(express.static(__dirname + '/public'));
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var {teams, teamName} = require('./public/team');
var gvar = {};
app.set('port', 8080);
app.set('ip', '0.0.0.0');

app.get('/', function (req, res, next) {
  res.send('SIMPIC academic');
});
app.get('/chat', function (req, res, next) {
  res.sendFile(__dirname + '/chat.html');
});
app.get(/.*user$/, function (req, res, next) {
  res.sendFile(__dirname + '/chat.html');
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
  console.log('[%s]: Node started on %s:%d ..', moment().format("MMMM Do YYYY, h:mm:ss a"), app.get('ip'), app.get('port'));
	console.log('For '+chalk.yellow('CONTROL PANEL')+' go to '+chalk.green('HOST:PORT/cp'));
	console.log('For '+chalk.yellow('MONITOR')+' go to '+chalk.green('HOST:PORT/mnt'));
	console.log('For '+chalk.yellow('CLIENT')+' go to '+chalk.green('HOST:PORT/'+chalk.black.bgRed('TEAM')+'user'));
	console.log();
	console.log('Available '+chalk.black.bgRed('TEAM')+`s are ${chalk.yellow('t1')}-${chalk.yellow('t7')} will represent these names :`);
	console.log(chalk.cyan(teams.map(function(data){return teamName[data.name]})));
	console.log('editable at public/team.js');
	console.log('\n---------------------------------------\n');
	
});



// #####*****----- socket -----*****##### //

var users = {};
var monIo = io.of('/monitor');
var chatIo = io.of('/chat');
var cpIo = io.of('/cp');
var scoreIo = io.of('/score');
var monSocket = void 0;

//console.log("---- All teams ----");
//console.log(teams);

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
    console.log(chalk.green(name + ' has joined'));
  });

  socket.on('imageSend', function (data) {
    var dd = new Date();
    cpIo.emit('image', { name: name, time: dd, timeLeft: data.time });
    chatIo.emit('image', { img: data.img, name: name });
    scoreIo.emit('submit', { name: name, time: data.time});

    console.log(chalk.red(`[${moment().format('hh:mm:ss.SSS')}]` + ': Image emitted by' + name));
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
    console.log(chalk.green("Activate drawing for " + data.second));
    data.time = moment();
    gvar.activateTime = moment();
    chatIo.emit('activateDraw', data);
    cpIo.emit('activateDraw', data);
  });

  socket.on('score', function (data) {
    console.log('Score has been made');
    monIo.emit('score', data);
  });

  socket.on('forceFinish', data=>{
    console.log('Force finish');
    chatIo.emit('forceFinish', true);
    cpIo.emit('forceFinish', true);
  })
});
