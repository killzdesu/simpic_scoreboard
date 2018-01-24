// import { watch } from "fs";

'use strict';

//modal
$('#nameModal').on('shown.bs.modal', function () {
  $('#nameInput').focus();
});
// $('#nameModal').modal({backdrop: 'static', keyboard: false});

var UserName = window.location.pathname.substr(1, window.location.pathname.length-5);
var timeGiven;
var startTime;
var stopTime;

//form
$('#nameForm').submit(event => {
  if ($('#nameInput').val() === '') 
    return false;
  name = $('#nameInput').val();
  socket.emit('name', {name});
  // socket.emit('drawing', canvas.toDataURL());
  $('#nameModal').modal('hide');
  $('#messageInput').attr('placeholder', 'Say something, ' + name);
  $('#yourname').html("("+name+")");
  event.preventDefault();
});

// alert(window.devicePixelRatio);
var canvas;
var update = picker => {
  canvas.freeDrawingBrush.color = '#' + picker;
};

var turnDrawOff = function(){
  if(canvas.isDrawingMode == true){
    stopTime = moment();
    var timeDiff = timeGiven-stopTime.diff(startTime, 'seconds', true);
    console.log(timeDiff.toFixed(1));
    window.timeDiff = timeDiff;
    canvas.isDrawingMode = false;
    canvas.backgroundColor = '#ddd';
    canvas.renderAll();
  }
}

var canvasControl = function(canvas, value){
  if(value > 0){
    timeGiven = value;
    startTime = moment();
    canvas.isDrawingMode = true;
    canvas.backgroundColor = '#fff';
    canvas.renderAll();
    var timeLeft = value;
    $("#time-left").html(timeLeft);
    var countDown = setInterval(function(){
      timeLeft--;
      $("#time-left").html(timeLeft);
      if(timeLeft == 0){
        if(canvas.isDrawingMode == true){
          socket.emit('imageSend', canvas.toDataURL());
          socket.emit('drawing', canvas.toDataURL());
        }
        turnDrawOff();
        clearInterval(countDown);
      }
    }, 1000);
  }
  else {
    turnDrawOff();
  }
}

var eraserMode = false;
var name;
var socket = io('/chat');
socket.emit('name', {name: UserName});
$('#yourname').html("("+UserName+")");
$(() => {
  $('canvas').attr('width', 600 / window.devicePixelRatio);
  $('canvas').attr('height', 600 / window.devicePixelRatio);
  canvas = new fabric.Canvas('c', {
    backgroundColor: '#ddd'
  });
  // console.log(canvas);
  canvas.isDrawingMode = false;
  canvas.selection = false;
  $('#clearButton').click(event => {
    canvas.clear();
    canvas.backgroundColor = "#fff";
    canvas.renderAll();
    socket.emit('drawing', canvas.toDataURL());
  });
  $('#sizeInput').on('input', event => {
    canvas.freeDrawingBrush.width = parseInt($('#sizeInput').val());
  });
  canvas.on('mouse:up', option => {
    if (canvas.size()) {
      canvas.item(canvas.size() - 1).set("perPixelTargetFind", true);
      canvas.item(canvas.size() - 1).set("selectable", false);
    }
    if(canvas.isDrawingMode == true){
      // socket.emit('drawing', canvas.toDataURL());
    }
  });
  canvas.on('mouse:over', function (e) {
    if (eraserMode == true) {
      // e.target.set("perPixelTargetFind", true);
      canvas.remove(e.target);
      socket.emit('drawing', canvas.toDataURL());
    }
  });

  $('#inputForm').submit(event => {
    event.preventDefault();
    if(canvas.isDrawingMode == false) return;
    turnDrawOff();
    socket.emit('imageSend', {img: canvas.toDataURL(), time: window.timeDiff});
    socket.emit('drawing', canvas.toDataURL());
    
  });

  $("#undoButton").click(function (e) {
    canvas.remove(canvas.item(canvas.size() - 1));
    socket.emit('drawing', canvas.toDataURL());
  });

  // ----- socket -----
  socket.on('image', data => {
    // update chat list -----
  });
  socket.on('connect',function() {
    console.log('Client has connected to the server!');
    // $('#nameModal').modal('show');
  });
  socket.on('activateDraw', data => {
    canvasControl(canvas, data.second);
  });
});