'use strict';
// alert(window.devicePixelRatio);
var canvas;
var update = picker => {
  canvas.freeDrawingBrush.color = '#' + picker;
};

var turnDrawOff = function(){
  canvas.isDrawingMode = false;
  canvas.backgroundColor = '#ddd';
  canvas.renderAll();
}

var canvasControl = function(canvas, value){
  if(value > 0){
    canvas.isDrawingMode = true;
    canvas.backgroundColor = '#fff';
    canvas.renderAll();
    var timeLeft = value;
    $("#time-left").html(timeLeft);
    var countDown = setInterval(function(){
      timeLeft--;
      $("#time-left").html(timeLeft);
      if(timeLeft == 0){
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
    if(canvas.isDrawingMode == true)
      socket.emit('drawing', canvas.toDataURL());
  });
  canvas.on('mouse:over', function (e) {
    if (eraserMode == true) {
      // e.target.set("perPixelTargetFind", true);
      canvas.remove(e.target);
      socket.emit('drawing', canvas.toDataURL());
    }
  });

  //modal
  $('#nameModal').on('shown.bs.modal', function () {
    $('#nameInput').focus();
  });
  $('#nameModal').modal({backdrop: 'static', keyboard: false});

  //form
  $('#nameForm').submit(event => {
    if ($('#nameInput').val() === '') 
      return false;
    name = $('#nameInput').val();
    socket.emit('name', {name});
    socket.emit('drawing', canvas.toDataURL());
    $('#nameModal').modal('hide');
    $('#messageInput').attr('placeholder', 'Say something, ' + name);
    $('#yourname').html("("+name+")");
    event.preventDefault();
  });

  $('#inputForm').submit(event => {
    event.preventDefault();
    if(canvas.isDrawingMode == false) return;
    socket.emit('imageSend', canvas.toDataURL());
    socket.emit('drawing', canvas.toDataURL());
    
  });

  $("#undoButton").click(function (e) {
    canvas.remove(canvas.item(canvas.size() - 1));
    socket.emit('drawing', canvas.toDataURL());
  });

  $("#eraserButton").click(function (e) {
    if (eraserMode == false) {
      eraserMode = true;
      canvas.isDrawingMode = false;
      $("#eraserButton")
        .addClass("btn-danger")
        .removeClass("btn-default");
    } else {
      eraserMode = false;
      canvas.isDrawingMode = true;
      $("#eraserButton")
        .addClass("btn-default")
        .removeClass("btn-danger");
    }
  });

  // ----- socket -----
  socket.on('image', data => {
    // update chat list -----
  });
  socket.on('activateDraw', data => {
    canvasControl(canvas, data.second);
  });
});