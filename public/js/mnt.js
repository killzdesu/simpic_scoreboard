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
  }
});

socket.on('userDraw', data => {
  if(window.disableDraw && window.disableDraw == true) return;
  let team = teams.find(t => t.name == data.name);
  if(team && data.img && !lockedScreen[team.index]){
    $(`.screen:eq(${team.index}) > div > img`).attr('src', data.img);
  }
});

socket.on('allUsers', data => {
  teams.forEach((team, index) => {
    if(data.hasOwnProperty(team.name)){
      $(`.screen:eq(${index}) > div > img`).attr('src', data[team.name]);
    }
  });
});

socket.on('score', data => {
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
