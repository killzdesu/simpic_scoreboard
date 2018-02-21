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
teams.push(new Team('Jui'));
teams.push(new Team('lnw'));
teams.push(new Team('zaa'));
teams.push(new Team('555'));
teams.push(new Team('Eiei'));
teams.push(new Team('Gum'));
teams.push(new Team('Lims'));

function addAllUsers(user) {
  teams.forEach(function (team) {
    user['team.name'] = team;
  });
  return user;
}
try{
module.exports = {teams: teams};
} catch(err){}
