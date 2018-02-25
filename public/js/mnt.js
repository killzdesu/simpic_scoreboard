$("h3").addClass('has-text-weight-bold');

var lockedScreen = [false,false,false,false,false,false,false];

teams.forEach((team, index) => {
  let name = team.name;
  if(teamName[name]) name = teamName[name];
  $(`.is-one-fifth:eq(${index}) > div > h3`).text(name);
  team.index = index;
});

var socket = io('/monitor');

socket.on('userChange', data => {
  let team = teams.find(t => t.name == data.name);
  if(team && data.img && !lockedScreen[team.index]){
    $(`.is-one-fifth:eq(${team.index}) > div > img`).attr('src', data.img);
  }
});

socket.on('allUsers', data => {
  teams.forEach((team, index) => {
    if(data.hasOwnProperty(team.name)){
      $(`.is-one-fifth:eq(${index}) > div > img`).attr('src', data[team.name]);
    }
  });
});

socket.on('score', data => {
  teams.forEach((team, index) => {
    if(data.hasOwnProperty(team.name)){
      if(data[team.name] == 1)
        $(`.is-one-fifth:eq(${index}) > div > h3`).css('background', 'lime').css('color', 'black');
      if(data[team.name] == -1)
        $(`.is-one-fifth:eq(${index}) > div > h3`).css('background', 'rgb(218, 55, 44)').css('color', 'white');
      if(data[team.name] == 0)
        $(`.is-one-fifth:eq(${index}) > div > h3`).css('background', '').css('color', 'black');
    }
  });
});

socket.on('lockScreen', data => {
  lockedScreen[data.index] = data.value;
});