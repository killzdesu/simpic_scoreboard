var cropImage = function() {
  var ctx = canvas.getContext('2d');
  var w = canvas.width,
    h = canvas.height,
    pix = {x:[], y:[]},
    imageData = ctx.getImageData(0,0,canvas.width,canvas.height),
    x, y, index;

  for (y = 0; y < h; y++) {
    for (x = 0; x < w; x++) {
      index = (y * w + x) * 4;
      if (imageData.data[index+3] > 0) {

        pix.x.push(x);
        pix.y.push(y);

      }
    }
  }
  pix.x.sort(function(a,b){return a-b});
  pix.y.sort(function(a,b){return a-b});
  var n = pix.x.length-1;

  w = pix.x[n] - pix.x[0];
  h = pix.y[n] - pix.y[0];
  //var cut = ctx.getImageData(pix.x[0], pix.y[0], w, h);

  console.log(pix.x[0], pix.y[0], w, h);

  socket.emit('imageSend', {
    img: canvas.toDataURL({
      left: pix.x[0],
      top: pix.y[0],
      width: w,
      height: h,
    }),
    time: window.timeDiff
  });


  //canvas.width = w;
  //canvas.height = h;
  //ctx.putImageData(cut, 0, 0);

  //var image = canvas.toDataURL();
  //var win=window.open(image, '_blank');
  //win.focus();
}


$("h3").addClass('has-text-weight-bold');
$('.is-gapless').css('margin-top', '-20px');

var lockedScreen = [false,false,false,false,false,false,false];
window.disableDraw = false;

teams.forEach((team, index) => {
  let name = team.name;
  if(teamName[name]) name = teamName[name];
  $(`.screen:eq(${index}) > div > h3`).text(name);
  team.index = index;
});

var socket = io('/monitor');

socket.on('userChange', data => {
  let team = teams.find(t => t.name == data.name);
  if(team && data.img && !lockedScreen[team.index]){
    $(`.screen:eq(${team.index}) > div > img`).attr('src', data.img);
		$(`.screen:eq(${team.index}) > .box`).addClass('sent-box');
  }
});
//window.disableDraw = true;
socket.on('userDraw', data => {
  //return;
  //if(window.disableDraw && window.disableDraw == true) return;
  let team = teams.find(t => t.name == data.name);
  if(team && data.img && !lockedScreen[team.index]){
    $(`.screen:eq(${team.index}) > div > img`).attr('src', data.img);
		$(`.screen:eq(${team.index}) > .box`).removeClass('sent-box');
  }
});

socket.on('allUsers', data => {
  teams.forEach((team, index) => {
    if(data.hasOwnProperty(team.name)){
      $(`.screen:eq(${index}) > div > img`).attr('src', data[team.name]);
      //console.log('data', getCrop(data[team.name]));
    }
  });
});

socket.on('judge', data => {
  teams.forEach((team, index) => {
    if(data.hasOwnProperty(team.name)){
      if(data[team.name] == 1)
        $(`.screen:eq(${index}) > div`).css('background', 'lime').css('color', 'black');
      if(data[team.name] == -1)
        $(`.screen:eq(${index}) > div`).css('background', 'rgba(253, 16, 0, 0.72)').css('color', 'white');
      if(data[team.name] == 0)
        $(`.screen:eq(${index}) > div`).css('background', '').css('color', 'black');
    }
  });
});

socket.on('lockScreen', data => {
  lockedScreen[data.index] = data.value;
});


var createImage = function (src) {
  var deferred = $.Deferred();
  var img = new Image();

  img.onload = function() {
    deferred.resolve(img);
  };
  img.src = src;
  return deferred.promise();
};

/*
 * Create an Image, when loaded pass it on to the resizer
 */
var startResize = function () {
  $.when(
    createImage($("#inputImage").attr('src'))
  ).then(resize, function () {console.log('error')});
};

/*
 * Draw the image object on a new canvas and half the size of the canvas
 * until the darget size has been reached
 * Afterwards put the base64 data into the target image
 */
var resize = function (image) {
  mainCanvas = document.createElement("canvas");
  mainCanvas.width = 1024;
  mainCanvas.height = 768;
  var ctx = mainCanvas.getContext("2d");
  ctx.drawImage(image, 0, 0, mainCanvas.width, mainCanvas.height);
  //$('#outputImage').attr('src', mainCanvas.toDataURL("image/jpeg"));
  return 'yes';
};
