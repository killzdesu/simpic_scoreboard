// ------ create scorer ------
teams.forEach((team, index) => {
  let checker = `
  <div class="control has-text-centered	">
  <h4 class="has-text-weight-bold ">${team.name}</h4>
  <label class="radio">
    <input type="radio" name="${team.name}" value="correct">
    Correct
  </label>
  <label class="radio">
    <input type="radio" name="${team.name}" value="wrong">
    Wrong
  </label>
</div><br/>`
  $('.score > div').append(checker);
});

function filterLogs(filter) {
  $("#filter-button-user").text("USER");
  switch (filter) {
    case 'ALL':
      $('ul > li').show();
      return;
    case 'ACTIVATE':
      $('ul > li').hide();
      $(`ul > li[data-tags="activate"]`).show();
      return;
    case 'CONNECT':
      $('ul > li').hide();
      $(`ul > li[data-tags="connect"]`).show();
      $(`ul > li[data-tags="disconnect"]`).show();
      return;
    case 'SUBMIT':
      $('ul > li').hide();
      $(`ul > li[data-tags="submit"]`).show();
      return;
    case 'USER':
      let user = prompt("Username");
      if (!user) {
        $('#filter-button-all').click();
        return;
      }
      $('ul > li').hide();
      $('ul > li').each(function () {
        if ($(this).text().indexOf(`${user}`) !== -1) {
          $(this).show();
        }
      });
      return;
    case 'CLICKED_USER':
      $('ul > li').hide();
      $('ul > li').each(function () {
        if ($(this).text().indexOf(`${window.clickedUser}`) !== -1) {
          $(this).show();
        }
      });
      return;
  }

}

function getUserLog(user) {
  return `<span class="tag is-primary">${user}</span>`;
}

$('#filter-button > p > a.button')
  .click(function () {
    $('#filter-button > p > a.is-link').removeClass('is-link');
    $(this).addClass('is-link');
    filterLogs($(this).text().trim());
  });

function getLogTime(date) {
  let time = `${ ('0' + date.getHours()).slice(-2)}:${ ('0' + date.getMinutes()).slice(-2)}:${ ('0' + date.getSeconds()).slice(-2)}`;
  time = time + ':' + ('00' + date.getMilliseconds()).slice(-3);
  time = `<span class="tag is-black" style="margin-right: 30px;">${time}</span>`;
  return time;
}

$(function () {

  var socket = io('/cp');

  document.getElementById('clear-log').addEventListener('click',function(){
    document.getElementById('log-cp').innerHTML = '';
  });

  $("#activateDraw").click(function (e) {
    second = $('#second').val();
    if (!second) 
      return;
    name = 'control panel'
    socket.emit('activate', {second, name});
    // $("#log-cp").append("<li data-tags='activate'>* Activate for <span
    // class=\"tag is-success\">" + second + "</span> second(s)</li>");
    $('#second').val('');
    e.preventDefault();
  });

  document.getElementById('#force-finish').addEventListener('click', e=>{
    socket.emit('forceFinish', true);
  });

  socket.on('activateDraw', data => {
    data.time = new Date(data.time);
    let logTime = getLogTime(data.time);
    $("#log-cp").append(`<li data-tags='activate'>${logTime} Activate for <span class="tag is-success">${second}</span> second(s)</li>`);
  });

  socket.on('image', data => {
    data.time = new Date(data.time);
    let submittedTime = getLogTime(data.time);
    $("#log-cp").append(`<li data-tags='submit'>${submittedTime} ${getUserLog(data.name)} submitted, time left ${data.timeLeft}</li>`);
  });

  socket.on('userConnect', data => {
    data.time = new Date(data.time);
    let submittedTime = getLogTime(data.time);
    $("#log-cp").append(`<li data-tags='connect'>${submittedTime} ${getUserLog(data.name)} <span class='tag is-success'>Connected</span></li>`);
  });

  socket.on('userDisconnect', data => {
    data.time = new Date(data.time);
    let submittedTime = getLogTime(data.time);
    $("#log-cp").append(`<li data-tags='disconnect'>${submittedTime} ${getUserLog(data.name)} <span class='tag is-danger'>Disconnected</span></li>`);
  });

  $('#send-score-button').click(function () {
    if (confirm('Do you want to score?')) {
      let score = {}; 
      teams.forEach((team, index) => {
        let correct = $(`input[name='${team.name}'][value="correct"]`);
        let wrong = $(`input[name='${team.name}'][value="wrong"]`);
        if (correct.is(':checked')) 
          score[team.name] = 1;
        else if (wrong.is(':checked')) 
          score[team.name] = -1;
        else 
          score[team.name] = 0;
        }
      );
      // console.log(score);
      socket.emit('score', score);
      $('input[type="radio"]').prop("checked", false);
    }
  });

  $("body").on('click', "span.is-primary", function () {
    window.clickedUser = $(this).text();
    $('#filter-button > p > a.is-link').removeClass('is-link');
    $('#filter-button-user').addClass('is-link');
    filterLogs('CLICKED_USER');
  });
});