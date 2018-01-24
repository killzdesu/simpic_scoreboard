'use strict';

// Object.defineProperty(exports, "__esModule", {
//   value: true
// });

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Team = function () {
  function Team(name) {
    _classCallCheck(this, Team);

    this.name = name;
    this.score = 0;
  }

  _createClass(Team, [{
    key: 'setName',
    value: function setName(name) {
      this.name = name;
    }
  }]);

  return Team;
}();

var teams = [];
teams.push(new Team('MWIT'));
teams.push(new Team('SCORE'));
teams.push(new Team('HI'));
teams.push(new Team('FY'));
teams.push(new Team('asdf'));
teams.push(new Team('asdasd'));
teams.push(new Team('jui'));

function addAllUsers(user) {
  teams.forEach(function (team) {
    user['team.name'] = team;
  });
  return user;
}

// exports.teams = teams;
// exports.Team = Team;
// exports.addAllUsers = addAllUsers;
