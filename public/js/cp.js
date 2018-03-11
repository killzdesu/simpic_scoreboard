// ------ create scorer ------
teams.forEach((team, index) => {
  let checker = `
  <div class="control has-text-centered	">
  <h4 class="has-text-weight-bold ">${teamName[team.name]}  <span class="tag is-info timeleft-tag" id='tag-item-${team.name}' style="display:none"></span></h4>
  <label class="radio">
    <input type="radio" name="${team.name}" value="correct">
    Correct
  </label>
  <label class="radio">
    <input type="radio" name="${team.name}" value="wrong">
    Wrong
  </label>
  <input type="text" class="text-score" id="text-${team.name}" placeholder="Score"/>
</div><br/>`
  $('.score > div').append(checker);
});

var getScoreFromTime = function(time){
  return 10+2*Math.floor(time/10);
}

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
  return `<span class="tag is-primary">${teamName[user]}</span>`;
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

var countDown = function(second) {
  var timeLeft = second;
  $("#time-left").html(timeLeft - 1);
  window.countdown = setInterval(function () {
    timeLeft--;
    $("#time-left").html(timeLeft - 1);
    if (timeLeft == 0) {
      $("#time-left").html('--');
      clearInterval(window.countdown);
    }
  }, 1000);
}

$(function () {

  var socket = io('/cp');

  document
    .getElementById('clear-log')
    .addEventListener('click', function () {
      document
        .getElementById('log-cp')
        .innerHTML = '';
      document
        .querySelectorAll('.timeleft-tag')
        .forEach(data => {
          data.innerText = '';
          data.style.display = 'none';
        });
    });

  $("#activateDraw").click(function (e) {
    second = $('#second').val();
    if (!second)
      return;
    name = 'control panel'
    if($("#time-left").text()!="--"){
      alert('Please force finish before activate new session');
      return;
    }
    else {
      socket.emit('activate', {second, name});
      $('#second').val('60');
    }
    e.preventDefault();
  });


  document
    .getElementById('force-finish')
    .addEventListener('click', e => {
      console.log('force Finish');
      socket.emit('forceFinish', true);
    });

  socket.on('activateDraw', data => {
    data.time = new Date(data.time);
    let logTime = getLogTime(data.time);
    $("#log-cp").prepend(`<li data-tags='activate'>${logTime} Activate for <span class="tag is-success">${second}</span> second(s)</li>`);
  });

  socket.on('image', data => {
    data.time = new Date(data.time);
    let submittedTime = getLogTime(data.time);
    $("#log-cp").prepend(`<li data-tags='submit'>${submittedTime} ${getUserLog(data.name)} submitted, time left ${data.timeLeft}</li>`);
    let tmp = document.getElementById('tag-item-' + data.name);
    if(tmp){
      tmp.style.display = '';
      tmp.innerText = data.timeLeft;
    }
    $('#text-'+data.name).val(getScoreFromTime(data.timeLeft));
  });

  socket.on('userConnect', data => {
    data.time = new Date(data.time);
    let submittedTime = getLogTime(data.time);
    $("#log-cp").prepend(`<li data-tags='connect'>${submittedTime} ${getUserLog(data.name)} <span class='tag is-success'>Connected</span></li>`);
  });

  socket.on('userDisconnect', data => {
    data.time = new Date(data.time);
    let submittedTime = getLogTime(data.time);
    $("#log-cp").prepend(`<li data-tags='disconnect'>${submittedTime} ${getUserLog(data.name)} <span class='tag is-danger'>Disconnected</span></li>`);
  });

  socket.on('activateDraw', data => {
    countDown(data.second);
  });

  socket.on('forceFinish', data => {
    clearInterval(window.countdown);
    document.getElementById('time-left').innerText = "--";
  });

  socket.on('sendResult', data => {
    console.log(data);
    for(var i=1;i<=7;i++){
      if(data[i] == 1){
        $('input[type="radio"][name*="'+i+'"][value="correct"]').attr("checked", true);
      }
      if(data[i] == 2){
        $('input[type="radio"][name*="'+i+'"][value="wrong"]').attr("checked", true);
        $('#text-t'+i).val(0);
      }
      if(data[i] == 0){
        $('input[type="radio"][name*="'+i+'"][value="correct"]').attr("checked", false);
        $('input[type="radio"][name*="'+i+'"][value="wrong"]').attr("checked", false);
      }
    }
  });
  $('#judge-score-button').click(function () {
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
      socket.emit('judgeMnt', score);
      $('input[type="radio"]').prop("checked", false);
    }
  });
  $('#emit-score-button').click(function(){
    var arr = [1];
    for(var i=1;i<=7;i++){
      arr.push(parseInt($('#text-t'+i).val()));
    }
   socket.emit('scoreMo', arr);
  });

  $("body").on('click', "span.is-primary", function () {
    window.clickedUser = $(this).text();
    $('#filter-button > p > a.is-link').removeClass('is-link');
    $('#filter-button-user').addClass('is-link');
    filterLogs('CLICKED_USER');
  });

  document.querySelectorAll('h4').forEach((el, index) => {
    let lockedColor = 'red';
    el.addEventListener('click', (e) => {
      if(el.style.color != lockedColor){
        if(confirm(`lock ${el.innerText.split(' ')[0]} screen?`)){
          el.style.color = lockedColor;
          socket.emit('lockScreen', {name: `t${index+1}`, index: index, value: true});
        }
      } else {
        if(confirm(`unlock ${el.innerText.split(' ')[0]} screen?`)){
          el.style.color = 'black';
          socket.emit('lockScreen', {name: `t${index+1}`, index: index, value: false});
        }
      }
    });
  });
  $(document).ready(function(){
    $('#clear-button').click(function(){
      document.querySelectorAll('input[type="radio"]').forEach(el => el.checked = false);
      $('input[type*="radio"]').attr('checked', false);
      for(var i=1;i<=7;i++){
        $('input[type="radio"][name*="'+i+'"][value="correct"]').attr("checked", false);
        $('input[type="radio"][name*="'+i+'"][value="wrong"]').attr("checked", false);
      }
    });
  });
});
