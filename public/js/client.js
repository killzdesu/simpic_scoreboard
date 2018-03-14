'use strict';

document.addEventListener('touchmove', function (event) {
  if (event.scale !== 1) { event.preventDefault(); }
}, false);


var UserName = window.location.pathname.substr(1, window.location.pathname.length-5);
var timeGiven;
var startTime;
var stopTime;

// alert(window.devicePixelRatio);
var canvas;
var update = picker => {
  canvas.freeDrawingBrush.color = '#' + picker;
};

var turnDrawOff = function(){
  if(canvas.isDrawingMode == true){
    stopTime = moment();
    var timeDiff = timeGiven-stopTime.diff(startTime, 'seconds', true);
    console.log("Time diff: " + timeDiff.toFixed(1));
    window.timeDiff = timeDiff.toFixed(1);
    canvas.isDrawingMode = false;
    canvas.backgroundColor = '#ddd';
    canvas.renderAll();
    $('#confirmButton').addClass('disabled');
  }
}

var canvasControl = function(canvas, value){
  if(value > 0){
    timeGiven = value;
    startTime = moment();
    canvas.isDrawingMode = true;
    //canvas.backgroundColor = '#FF0000';
    canvas.renderAll();
    var timeLeft = value;
    $('#confirmButton').removeClass('disabled');
    $("#time-left").html(timeLeft-1);
    for(let It = 1; It <= 99999 ; It ++) clearInterval(It);
    window.countdown = setInterval(function(){
      timeLeft--;
      $("#time-left").html(timeLeft-1);
      if(timeLeft <= 0){
        if(canvas.isDrawingMode == true){
          if(value-moment().diff(startTime) < 3){
            turnDrawOff();
            canvas.backgroundColor = null;
            socket.emit('imageSend', {img: canvas.toDataURL(), time: 0.0});
            console.log('asdasd');
            //socket.emit('drawing', canvas.toDataURL());
            canvas.backgroundColor = '#DDDDDD';
            canvas.renderAll();
          }
          else{
            alert('contact staff');
          }
        }
        $("#time-left").html('--');
        clearInterval(window.countdown);
      }
    }, 1000);
    socket.emit('drawing', canvas.toDataURL());
  }
  else {
    turnDrawOff();
  }
}

function clearBoard(){
  canvas.clear();
  canvas.setBackgroundColor(null, canvas.renderAll.bind(canvas));
  canvas.renderAll();
  //socket.emit('drawing', canvas.toDataURL());
}

var eraserMode = false;
var name;
var socket = io('/chat');

$('#yourname').html("("+teamName[UserName]+")");
$(() => {
	if(teams.filter(t=>{return t.name == UserName;}).length == 0){
		alert('This username is not in the team list');
	}
  $('canvas').attr('width', 1800 / window.devicePixelRatio);
  $('canvas').attr('height', 1200 / window.devicePixelRatio);
  canvas = new fabric.Canvas('c', {
    backgroundColor: '#ddd'
  });
  canvas.renderAll();
  // console.log(canvas);
  canvas.isDrawingMode = false;
  canvas.selection = false;
  canvas.freeDrawingBrush.width = 6;
  $('#clearButton').click(event => {
    if(canvas.isDrawingMode == false){
      if(window.handSubmitted != true) window.location.reload(true);
      return;
    }
    else {
      clearBoard();
    }
		event.target.blur();
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
       //socket.emit('drawing', canvas.toDataURL());
    }
  });
  canvas.on('mouse:over', function (e) {
    if (eraserMode == true) {
      canvas.remove(e.target);
      socket.emit('drawing', canvas.toDataURL());
    }
  });

  $('#submitButton').click(event => {
    event.preventDefault();
    if(canvas.isDrawingMode == false) return;
    if(true || window.confirm('You sure to submit?')){
      turnDrawOff();
      canvas.backgroundColor = null;
      socket.emit('imageSend', {img: canvas.toDataURL(), time: window.timeDiff});
      window.handSubmitted = true;
      //socket.emit('drawing', canvas.toDataURL());
      canvas.backgroundColor = '#DDDDDD';
      canvas.renderAll();
    }

  });

  $("#undoButton").click(function (e) {
		e.target.blur();
    if(canvas.isDrawingMode == false) return;
    canvas.remove(canvas.item(canvas.size() - 1));
    //socket.emit('drawing', canvas.toDataURL());
  });

  $('#confirmButton').click(e=>{
		e.target.blur();
    if(canvas.isDrawingMode)
      $('#confirmModal').modal('toggle');
  });


  // ----- socket -----
  socket.on('image', data => {
    // update chat list -----
  });

  socket.on('connect',function() {
    console.log('Client has connected to the server!');
    socket.emit('name', {name: UserName});
  });

  socket.on('activateDraw', data => {
    window.handSubmitted = false;
    clearBoard();
    canvasControl(canvas, data.second);
  });

  socket.on('forceFinish', data => {
    clearInterval(window.countdown);
    document.getElementById('time-left').innerHTML = '--';
		if(canvas.isDrawingMode	== false) return;
    turnDrawOff();
    socket.emit('imageSend', {img: canvas.toDataURL(), time: window.timeDiff});
    //socket.emit('drawing', canvas.toDataURL());
  });

});
