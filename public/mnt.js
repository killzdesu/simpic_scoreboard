$("h3").addClass('has-text-weight-bold');

teams.forEach((team, index) => {
  $(`.is-one-fifth:eq(${index}) > div > h3`).text(team.name);
  team.index = index;
});

var socket = io('/monitor');

socket.on('userChange', data => {
  let team = teams.find(t => t.name == data.name);
  if(team && data.img){
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